//
//  SdCard.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 9.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import MobileCoreServices
import UIKit
import PromiseKit

class SdCardService {
    
    private func getMyURLForBookmark() -> URL {
        return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!.appendingPathComponent("bookmark")
    }
    
    func open(_ delegate: ViewController) {
        let documentPicker =
            UIDocumentPickerViewController(documentTypes: [kUTTypeFolder as String], in: .open)
        documentPicker.delegate = delegate

        // Present the document picker.
        delegate.present(documentPicker, animated: true, completion: nil)
    }
    
    func writeBookmark(urls: [URL]) -> URL? {
        guard let url = urls.first,
            url.startAccessingSecurityScopedResource() else {
                print("Bookmarking failed to open security")
                return nil
        }
        defer { url.stopAccessingSecurityScopedResource() }
        
        do {
            let bookmarkData = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)

            try bookmarkData.write(to: getMyURLForBookmark())
            
            return url
        } catch let error {
            print("Bookmarking failed \(error)")
            return nil
        }
    }

    func readBookmark() -> URL? {
        do {
            let bookmarkData = try Data(contentsOf: getMyURLForBookmark())
            var isStale = false
            let url = try URL(resolvingBookmarkData: bookmarkData, bookmarkDataIsStale: &isStale)
            
            guard !isStale else {
                return nil
            }
            
            return url
        } catch let error {
            print("\(error)")
            return nil
        }
    }
    
    public func query(after: Date) -> Promise<[URL]> {
        
        guard let url = readBookmark() else {
            return Promise(error: SambaError(text: "No bookmark"))
        }
        
        return Promise { seal in
            var error: NSError? = nil
            NSFileCoordinator().coordinate(readingItemAt: url, error: &error) { (folderUrl) in
                seal.fulfill(listDirectory(url: folderUrl, after: after))
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
