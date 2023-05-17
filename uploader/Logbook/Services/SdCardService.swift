//
//  SdCard.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 9.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import MobileCoreServices
import PromiseKit
import Foundation

class SdCardService {
    
    public func query(after: Date) async -> [URL] {
        
        guard let url = Bookmark.read() else {
            return []
        }

        return await withCheckedContinuation { continuation in
            var error: NSError? = nil
            NSFileCoordinator().coordinate(readingItemAt: url, error: &error) { (folderUrl) in
                let urls = listDirectory(url: folderUrl, after: after)
                continuation.resume(returning: urls)
            }
            if let error = error {
                print("\(error)")
            }

        }
    }
    
    func listDirectory(url: URL, after: Date) -> [URL] {
        let keys : [URLResourceKey] = [.nameKey, .isDirectoryKey, .contentModificationDateKey]
                    
        guard let fileList =
            FileManager.default.enumerator(at: url, includingPropertiesForKeys: keys) else {
                print("*** Unable to access the contents of \(url.path) ***\n")
                return []
        }
        
        return fileList.compactMap { file in
            guard let sourceUrl = file as? URL,
                sourceUrl.lastPathComponent.lowercased().hasSuffix(".csv"),
                let resourceValues = try? sourceUrl.resourceValues(forKeys: Set(keys)),
                let modified = resourceValues.contentModificationDate,
                modified > after && resourceValues.isDirectory == false
                else {
                    print("Skipped file \(file)")
                    return nil
            }
            
            print("File \(sourceUrl.lastPathComponent) \(modified)")
            return download(source: file as! URL)
        }
    }
    
    func download(source: URL) -> URL? {
        guard let destFolder = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).last else {
            print("Destination folder not found")
            return nil
        }
        let target = destFolder.appendingPathComponent(source.lastPathComponent)

        do {
            if FileManager.default.fileExists(atPath: target.path) {
                try FileManager.default.removeItem(at: target)
            }
            try FileManager.default.copyItem(at: source, to: target)
            print("Copied \(target.path)")
            return target
        } catch let error {
            print("Failed to copy \(source.path) to \(target.path) bacause \(error)")
            return nil
        }
    }
}
