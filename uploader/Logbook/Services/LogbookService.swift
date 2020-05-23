//
//  LogbookService.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 10.02.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import Foundation
import PromiseKit
import PMKFoundation
import SwiftyJSON
import CoreLocation

typealias LogbookResult = (date: Date?, closestLocation: LogbookLocation?)

typealias LogbookLocation = (id: Int, name: String, distance: Float)

class LogbookService {
    
    private let dateFormatter = DateFormatter()
    
    init() {
        self.dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    }
    
    private func apiUrl(logbookApi: String) -> String {
        return logbookApi + (logbookApi.last == "/" ? "" : "/") + "api/"
    }

    
    func fetchLatestFlight(logbookApi: String, location: CLLocationCoordinate2D?) -> Promise<LogbookResult> {
        let url = apiUrl(logbookApi: logbookApi) + "graphql"
        
        let query = """
            query($lat:Float, $lon:Float) {
                flights(first:1, orderBy:START_DATE_DESC) {
                    nodes {
                        endDate
                    }
                }
                locationsByCoordinate(lat: $lat, lon: $lon) {
                  nodes {
                    id
                    name
                    distance
                  }
                }
            }
"""
        
        let body = """
        {
            "query": "\(query.replacingOccurrences(of: "\n", with: " "))",
            "variables": {
                "lat": \(location?.latitude != nil ? String(location!.latitude) : "null"),
                "lon": \(location?.longitude != nil ? String(location!.longitude) : "null")
            }
        }
"""
        
        return fetch(url: url, body: body).map { res -> LogbookResult in
            if let data:JSON = res?["data"],
                let lastFlight = data["flights"]["nodes"].array?.first?["endDate"].string,
                let locations = res?["data"]["locationsByCoordinate"]["nodes"].array {
                
                let location: LogbookLocation? = locations.first.flatMap { (elem) in
                    if let id = elem["id"].int,
                        let name = elem["name"].string,
                        let distance = elem["distance"].float {
                        return LogbookLocation(id, name, round(distance/100) / 10)
                    } else {
                        return nil
                    }
                }
                
                // remove milliseconds and round up so that we don't end up reuploading the last flight
                let withoutMilliseconds = lastFlight.replacingOccurrences(of: "\\.\\d+", with: "", options: .regularExpression)
                let date = self.dateFormatter.date(from: withoutMilliseconds)?.addingTimeInterval(TimeInterval(1))
                
                return LogbookResult(date, location)
            } else if let error = res?["errors"].arrayValue.first?["message"].string {
                throw LogbookError(text: error)
            }
            return LogbookResult(nil, nil)
        }
    }
    
    private func fetch(url: String, body: String) -> Promise<JSON?> {
        print("Fetching data from \(url)")
        let url = URL(string: url)!
        var rq = URLRequest(url: url)
        rq.httpMethod = "POST"
        rq.httpBody = body.data(using: String.Encoding.utf8)
        rq.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        return URLSession.shared.dataTask(.promise, with: rq).map { data, _ -> JSON in
            return try JSON(data: data)
        }
    }
    
    func upload(logbookApi: String, files: [URL], locationId: Int?) -> Promise<[String]> {
        let url = URL(string: apiUrl(logbookApi: logbookApi) + "flights")!
        var rq = URLRequest(url: url)
        rq.httpMethod = "POST"
        
        let boundary = "Boundary-\(UUID().uuidString)"
        rq.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        let mimeType = "text/csv"
        
        let body = NSMutableData()
        
        files.forEach { file in
            body.appendString("--\(boundary)\r\n")
            body.appendString("Content-Disposition: form-data; name=\"flight\"; filename=\"\(file.lastPathComponent)\"\r\n")
            body.appendString("Content-Type: \(mimeType)\r\n\r\n")
            body.append(try! Data(contentsOf: file))
            body.appendString("\r\n")
        }
        body.appendString("--".appending(boundary).appending("--\r\n"))
        rq.setValue(String(TimeZone.current.secondsFromGMT() / 3600), forHTTPHeaderField: "TIMEZONE_OFFSET")
        if let locationId = locationId {
            rq.setValue(String(locationId), forHTTPHeaderField: "LOCATION_ID")
        }
        rq.httpBody = body as Data
        
        print("Fetching data from \(url)")
        return URLSession.shared.dataTask(.promise, with: rq).map { (arg) in
            
            let (data, _) = arg
            return try JSON(data: data).arrayValue.map { item in
                item["id"].stringValue
            }
        }
    }
}

extension NSMutableData {
    func appendString(_ string: String) {
        let data = string.data(using: String.Encoding.utf8, allowLossyConversion: false)
        append(data!)
    }
}

struct LogbookError: Error, LocalizedError {
    let text: String
  
    var errorDescription: String? {
        return text
    }
}
