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

class LogbookService {
    
    private let dateFormatter = DateFormatter()
    
    init() {
        self.dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    }
    
    private func flightsUrl(logbookApi: String) -> String {
        return logbookApi + (logbookApi.last! == "/" ? "" : "/") + "api/flights"
    }
    
    func fetchLatestFlight(logbookApi: String) -> Promise<Date?> {
        let url = flightsUrl(logbookApi: logbookApi)
        
        return fetch(url: url).then { flightDates -> Promise<Date?> in
            if let flightDate = flightDates?.array?.first {
                return self.fetch(url: "\(url)/\(flightDate["date"])").map { flights in
                    if let flight = flights?.array?.first {
                        return self.dateFormatter.date(from: flight["endDate"].stringValue)
                    } else {
                        return nil
                    }
                }
            }
            return Promise.value(nil)
        }
    }
    
    private func fetch(url: String) -> Promise<JSON?> {
        print("Fetching data from \(url)")
        return URLSession.shared.dataTask(.promise, with: URL(string: url)!).map { data, _ -> JSON in
            return try JSON(data: data)
        }
    }
    
    func upload(logbookApi: String, files: [URL]) -> Promise<[String]> {
        let url = URL(string: flightsUrl(logbookApi: logbookApi))!
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
