//
//  UserSettings.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 13.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import Combine
import SwiftUI

final class UserSettings: ObservableObject  {
    
    private let sourceFolderKey = "smbName"
    @Published var sourceFolder = ""
    
    private let targetURLKey = "logbookApiUrl"
    @Published var targetURL = ""
    
    private let SMB_PREFIX = "smb://"
    
    private var cancellables: [AnyCancellable] = []
    
    init() {
        sourceFolder = load(key: sourceFolderKey, value: $sourceFolder)
        targetURL = load(key: "logbookApiUrl", value: $targetURL)
    }
    
    private func load(key: String, value: Published<String>.Publisher) -> String {
        value.debounce(for: 0.5, scheduler: DispatchQueue.main).sink { newText in
            UserDefaults.standard.set(newText, forKey: key)
            UserDefaults.standard.synchronize()
        }.store(in: &cancellables)
        return UserDefaults.standard.string(forKey: key) ?? ""
    }

    func getSmbPath() -> String? {
        guard sourceFolder.starts(with: SMB_PREFIX) else {
            return nil
        }
        return String(sourceFolder.dropFirst(SMB_PREFIX.count))
    }
}
