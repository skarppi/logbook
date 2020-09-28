//
//  LogbookApp.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 28.9.2020.
//

import SwiftUI

@main
struct LogbookApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(UserSettings())
        }
    }
}
