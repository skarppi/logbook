//
//  SambaClient.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 10.02.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import Foundation
import SMBClient
import PromiseKit

public class SambaClient {
    
    let server: SMBServer
    var session: SMBSession!
    
    init?(hostname: String) {
        if let server = SMBServer(hostname: hostname) {
            self.server = server
            self.session = SMBSession(server: server, credentials: .guest)
        } else {
            return nil
        }
    }
    
    public func query(after: Date) -> Promise<[SMBFile]> {
        return requestVolumePath().then { path in
            self.requestLogs(path: path, after: after)
        }
    }
    
    private func requestVolumePath() -> Promise<SMBPath> {
        return Promise { seal in
            session.requestVolumes(completion: { (result) in
                switch result {
                case .success(let volumes):
                    if (volumes.count > 0) {
                        seal.fulfill(volumes[0].path)
                    } else {
                        seal.reject(PMKError.badInput)
                    }
                case .failure(let error):
                    seal.reject(error)
                }
            })
        }
        
    }
    
    private func requestLogs(path: SMBPath, after: Date) -> Promise<[SMBFile]> {
        let url = path.asURL.appendingPathComponent("LOGS", isDirectory: true)
        let path = SMBPath(fromURL: url)!
        
        return Promise { seal in
            session.requestItems(atPath: path) { (result) in
                switch result {
                case .success(let items):
                    seal.fulfill(items.compactMap({ item in
                        if case let SMBItem.file(file) = item, file.modifiedAt! > after {
                            return file
                        } else {
                            return nil
                        }
                    }))
                case .failure(let error):
                    seal.reject(error)
                }
            }
        }
    }
    
    func download(file: SMBFile, progress: @escaping (Int)-> Void) -> Promise<URL> {
        guard let destFolder = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).last else { return Promise(error: SambaError(text: "Destination folder not found")) }
        let fileURL = destFolder.appendingPathComponent(file.name)
        
        do {
            // clean old file
            try FileManager.default.removeItem(at: fileURL)
        } catch {
            print("Cleaning destination failed")
        }
        
        let delegate = LogDelegate(progress: progress)
        delegate.retainCycle = delegate
        session.downloadTaskForFile(file: file, destinationFileURL: fileURL, delegate: delegate)
        
        return delegate.promise
    }
}

class LogDelegate: NSObject, SessionDownloadTaskDelegate {
    var progress: (Int) -> Void
    
    let (promise, resolver) = Promise<URL>.pending()
    
    var retainCycle: NSObject?
    
    init(progress: @escaping (Int) -> Void) {
        self.progress = progress
    }
    
    public func downloadTask(didFinishDownloadingToPath: String) {
        resolver.fulfill(URL(string: didFinishDownloadingToPath)!)
        retainCycle = nil
    }
    public func downloadTask(totalBytesReceived: UInt64, totalBytesExpected: UInt64) {
        progress(Int(totalBytesReceived))
    }
    public func downloadTask(didCompleteWithError: SessionDownloadTask.SessionDownloadError) {
        resolver.reject(didCompleteWithError)
        retainCycle = nil
    }
}

struct SambaError: Error {
    let text: String
}
