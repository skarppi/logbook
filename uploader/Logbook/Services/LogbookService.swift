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
    
    private func apiUrl(logbookApi: String) -> String {
        return logbookApi + (logbookApi.last! == "/" ? "" : "/") + "api/"
    }
    
    func fetchLatestFlight(logbookApi: String) -> Promise<Date?> {
        let url = apiUrl(logbookApi: logbookApi) + "graphql"
        
        let query = """
            query {
                allFlights(first:1, orderBy:START_DATE_DESC) {
                    nodes {
                        endDate
                    }
                }
            }
"""
        
        return fetch(url: url, body: query).map { res -> Date? in
            if let lastFlight = res?["data"]["allFlights"]["nodes"].array?.first?["endDate"].string {
                return self.dateFormatter.date(from: lastFlight)
            } else if let error = res?["errors"].arrayValue.first?["message"].string {
                throw LogbookError(text: error)
            }
            return nil
        }
    }
    
    private func fetch(url: String, body: String) -> Promise<JSON?> {
        print("Fetching data from \(url)")
        let url = URL(string: url)!
        var rq = URLRequest(url: url)
        rq.httpMethod = "POST"
        rq.httpBody = body.data(using: String.Encoding.utf8)
        rq.setValue("application/graphql", forHTTPHeaderField: "Content-Type")
        
        return URLSession.shared.dataTask(.promise, with: rq).map { data, _ -> JSON in
            return try JSON(data: data)
        }
    }
    
    func upload(logbookApi: String, files: [URL], splitAfterSeconds: Int) -> Promise<[String]> {
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
        rq.setValue(String(splitAfterSeconds), forHTTPHeaderField: "SPLIT_FLIGHTS_AFTER_SECONDS")
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
