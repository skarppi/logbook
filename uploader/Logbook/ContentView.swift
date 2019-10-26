//
//  SwiftUIView.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 13.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import SwiftUI
import MobileCoreServices
//import UIKit

struct ContentView: View {
    @EnvironmentObject var userSettings: UserSettings
    
    private var samba: SambaClient!
    
    private var logbook = LogbookService()
    
    private var sdCard = SdCardService()
    
    private var files: [URL] = []
    
    private var lastSync: Date?
    
    @State var output = ""

    @State var documentPickerViewModel = DocumentPickerViewModel()
    
    var body: some View {
        VStack {
            VStack(alignment: .leading, spacing: 1.0) {
                Text("Source folder or host")
                HStack {
                    TextField("Source or smb://hostname", text: $userSettings.sourceFolder)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    Button(action: { self.documentPickerViewModel.isPresented.toggle()
                    }) {
                        HStack {
                            Text("Select")
                            Image(systemName: "folder")
                        }
                    }
                    .sheet(isPresented: $documentPickerViewModel.isPresented) {
                        DocumentPickerView(model: self.$documentPickerViewModel)
                    }
                    .onReceive(documentPickerViewModel.pickedDocumentSubject) { (url: URL) -> Void in
                        withAnimation {
                            self.output = "Selected folder \(url.lastPathComponent)"
                            self.userSettings.setSourceFolder(url.lastPathComponent)
                        }
                    }
                }
            }
            VStack(alignment: .leading, spacing: 1.0) {
                Text("Logbook service URL")
                TextField("https://hostname", text: $userSettings.targetURL)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }

            ScrollView() {
                HStack {
                    Text(output)
                        .font(.callout)
                        .foregroundColor(Color.secondary)
                        .lineLimit(nil)
                        .multilineTextAlignment(.leading)
                    Spacer()
                }
            }
            Button(action: {}) {
                Text("Refresh")
                    .padding()
            }
            Button(action: {}) {
                Text("Sync")
                    .padding()
            }
        }
        .padding()
        .background(
            Color(.systemBackground).edgesIgnoringSafeArea(.all)
        )

    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ContentView()
                .environment(\.colorScheme, .light)
                .environmentObject(UserSettings())
            
            ContentView()
                .environment(\.colorScheme, .dark)
                .environmentObject(UserSettings())
        }
    }
}
