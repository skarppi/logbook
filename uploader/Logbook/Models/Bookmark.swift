//
//  Bookmark.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 26.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import Foundation

struct Bookmark {
    
    static private func getMyURLForBookmark() -> URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return docs.first!.appendingPathComponent("bookmark")
    }

    static func write(url: URL) -> URL? {
        do {
            let bookmarkData = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)

            try bookmarkData.write(to: getMyURLForBookmark())
            
            return url
        } catch let error {
            print("Bookmarking failed \(error)")
            return nil
        }
    }

    static func read() -> URL? {
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
}
