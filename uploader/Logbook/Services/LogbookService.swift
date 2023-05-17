//
//  LogbookService.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 10.02.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import Foundation
import SwiftyJSON
import CoreLocation

typealias LogbookResult = (date: Date?, locations: [LogbookLocation])

struct LogbookLocation: Identifiable {
    var id: Int
    var name: String
    var distance: Float = 0
    
    func toString() -> String {
        return "\(name) at \(distance)km"
    }
}

class LogbookService {
    
    private let dateFormatter = DateFormatter()
    
    init() {
        self.dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    }
    
    private func apiUrl(logbookApi: String) -> String {
        return logbookApi + (logbookApi.last == "/" ? "" : "/") + "api/"
    }

    
    func fetchLatestFlight(logbookApi: String) async throws -> Date? {
        let query = """
            query {
                flights(first:1, orderBy:START_DATE_DESC) {
                    nodes {
                        endDate
                    }
                }
            }
"""
        
        let res = try await fetch(logbookApi: logbookApi, query: query, vars: [:])

        if let data:JSON = res?["data"],
            let lastFlight = data["flights"]["nodes"].array?.first?["endDate"].string{

            // remove milliseconds and round up so that we don't end up reuploading the last flight
            let withoutMilliseconds = lastFlight.replacingOccurrences(of: "\\.\\d+", with: "", options: .regularExpression)
            return self.dateFormatter.date(from: withoutMilliseconds)?.addingTimeInterval(TimeInterval(1))
        } else if let error = res?["errors"].arrayValue.first?["message"].string {
            throw LogbookError(text: error)
        } else {
            return nil
        }
    }
    
    func fetchLocations(logbookApi: String, location: CLLocationCoordinate2D) async throws -> [LogbookLocation] {
        let query = """
            query($lat:Float, $lon:Float) {
                locationsByCoordinate(lat: $lat, lon: $lon) {
                  nodes {
                    id
                    name
                    distance
                  }
                }
            }
"""
        
        let res = try await fetch(logbookApi: logbookApi, query: query, vars: ["lat": String(location.latitude), "lon": String(location.longitude) ])

        if let locations = res?["data"]["locationsByCoordinate"]["nodes"].array {
            return locations.compactMap { (elem) in
                if let id = elem["id"].int,
                    let name = elem["name"].string,
                    let distance = elem["distance"].float {
                    return LogbookLocation(id: id, name: name, distance: round(distance/100) / 10)
                } else {
                    return nil
                }
            }
        } else if let error = res?["errors"].arrayValue.first?["message"].string {
            throw LogbookError(text: error)
        } else {
            return []
        }
    }
    
    private func fetch(logbookApi: String, query: String, vars: [String: String]) async throws -> JSON? {
        let varStr: [String] = vars.map { (key: String, value: String) -> String in
            "\"\(key)\": \(value)"
        }
        
        let body = """
        {
            "query": "\(query.replacingOccurrences(of: "\n", with: " "))",
            "variables": {
                \(varStr.joined(separator: ","))
            }
        }
        """
        
        let url = URL(string: apiUrl(logbookApi: logbookApi) + "graphql")!
        print("Fetching data from \(url)")

        var rq = URLRequest(url: url)
        rq.httpMethod = "POST"
        rq.httpBody = body.data(using: String.Encoding.utf8)
        rq.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, v)  = try await URLSession.shared.data(for: rq)
        print(v)

        return try JSON(data: data)
    }
    
    func upload(logbookApi: String, files: [URL], locationId: Int?) async throws -> [String] {
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
        let (data, _) = try await URLSession.shared.upload(for: rq, from: body as Data)

        return try JSON(data: data).arrayValue.map { item in
            item["id"].stringValue
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
