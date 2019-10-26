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
    
    @Published var sourceFolder = ""
    @Published var targetURL = ""
    
    init() {
        sourceFolder = load(key: "smbName")
        targetURL = load(key: "logbookApiUrl")
    }
    
    private func load(key: String) -> String {
        return UserDefaults.standard.string(forKey: key) ?? ""
    }
    
    private func store(key: String, value: String) {
        UserDefaults.standard.set(value, forKey: key)
        UserDefaults.standard.synchronize()
    }
    
    func setSourceFolder(_ value: String) {
        sourceFolder = value
        store(key: "smbName", value: value)
    }

    func setTargetURL(_ value: String) {
        targetURL = value
        store(key: "logbookApiUrl", value: value)
    }
}
