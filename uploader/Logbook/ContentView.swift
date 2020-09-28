//
//  ContentView.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 13.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import SwiftUI
import MobileCoreServices
import PromiseKit
import SMBClient
import CoreLocation

class Locations: ObservableObject {
    var list: [LogbookLocation] = [] {
        willSet {
          id = UUID()
        }
    }

    @Published var selected: Int?
    @Published var id: UUID = UUID()
}

struct ContentView: View {
    @EnvironmentObject var userSettings: UserSettings
        
    private var samba = SambaClient()
    
    private var logbook = LogbookService()
    
    private var sdCard = SdCardService()
    
    private var location = LocationService()
    
    @State var files: [URL] = []
    
    @ObservedObject var locations = Locations()
    
    @State var lastSync: Date?
    
    @State var output = ""

    @State var documentPickerViewModel = DocumentPickerViewModel()
            
    var body: some View {
        VStack {
            VStack(alignment: .leading, spacing: 1.0) {
                Text("Source folder or host")
                HStack {
                    TextField("Source or smb://hostname", text: $userSettings.sourceFolder)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .textContentType(UITextContentType.URL)
                        .autocapitalization(UITextAutocapitalizationType.none)
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
                            self.userSettings.sourceFolder = url.lastPathComponent
                        }
                    }
                }
            }
            VStack(alignment: .leading, spacing: 1.0) {
                Text("Logbook service URL")
                TextField("https://hostname", text: $userSettings.targetURL)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }

            Picker(selection: $locations.selected, label: Text("Location")) {
                Text("---").tag(nil as Int?)
                ForEach(locations.list) { loc in
                    Text(loc.toString()).tag(loc.id as Int?)
                }
            }.id(locations.id)
            
            Button(action: refresh) {
                Text("Refresh")
                    .padding()
            }
            Button(action:sync) {
                Text("Sync")
                    .padding()
            }.disabled(files.isEmpty)
        
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
        }
        .padding()
        .background(
            Color(.systemBackground).edgesIgnoringSafeArea(.all)
        ).onAppear(perform: {
            self.location.requestLocation(fulfill: self.acquiredLocation, reject: self.log)
        })
    }
    
    func log(_ row: String) {
        output += "\(row)\n"
    }

    func log(_ row: String, _ date: Date) {
        let dateFormatter = DateFormatter()
        dateFormatter.timeZone = TimeZone.current
        dateFormatter.dateStyle = DateFormatter.Style.long
        dateFormatter.timeStyle = DateFormatter.Style.medium

        log("\(row) \(dateFormatter.string(from: date))")
    }
    
    func acquiredLocation(coord: CLLocationCoordinate2D) {
        log("Got location \(coord.latitude), \(coord.longitude)")
        
        logbook.fetchLocations(logbookApi: userSettings.targetURL, location: coord).done { locations in
            self.locations.list = locations
            
            if let loc = locations.first {
                self.log("Closest location is \(loc.name) at \(loc.distance)km")
                self.locations.selected = loc.id
            } else {
                self.log("Location not available")
                self.locations.selected = nil
            }
            
        }.catch { error in
            self.log(error.localizedDescription)
        }.finally {
            if let lastSync = self.lastSync {
                self.fetchNewFiles(after: lastSync)
            }
        }
    }
    
    func refresh() {
        files = []
        
        if let smbPath = userSettings.getSmbPath() {
            log("Connecting to \(smbPath)")
            if samba.connect(hostname: smbPath) {
                log("Connected to \(smbPath) (\(samba.server.ipAddressString))")
            } else {
                log("Unable to connect to \(smbPath)")
            }
            return
        } else if let bookMark = Bookmark.read() {
            if bookMark.lastPathComponent != userSettings.sourceFolder {
                documentPickerViewModel.isPresented = true
            }
        } else {
            documentPickerViewModel.isPresented = true
        }

        logbook.fetchLatestFlight(logbookApi: userSettings.targetURL).done { date in
            if let date = date {
                self.log("Last flight", date)
            } else {
                self.log("No previous flights")
            }

            self.lastSync = date ?? Date(timeIntervalSince1970: 0)
        }.catch { error in
            self.log(error.localizedDescription)
        }.finally {
            if let lastSync = self.lastSync {
                self.fetchNewFiles(after: lastSync)
            }
        }
    }
    
    private func fetchNewFiles(after: Date) {
        log("Fetching new log files...")
        
        if userSettings.getSmbPath() != nil {
            samba.query(after: after).done { files in
                guard files.count > 0 else {
                    self.log("No new flights")
                    return
                }
                
                let promises = files.compactMap { file in self.download(file: file) }
                
                firstly {
                    when(fulfilled: promises)
                }.done { files in
                    self.files = files
                }
            }.catch { error in
                self.log(error.localizedDescription)
            }
        } else {
            sdCard.query(after: after).done { files in
                guard files.count > 0 else {
                    self.log("No new flights")
                    return
                }
                files.forEach { url in
                    let keys: [URLResourceKey] = [.fileSizeKey, .contentModificationDateKey]
                    guard let resourceValues = try? url.resourceValues(forKeys: Set(keys)),
                        let size = resourceValues.fileSize,
                        let date = resourceValues.contentModificationDate
                        else {
                            print("No properties for file \(url.path)")
                            return
                    }
                    
                    self.log(url.lastPathComponent + " [\(size/1000)kb]", date)
                }
                self.files = files
            }.catch { error in
                self.log(error.localizedDescription)
            }
        }
    }
    
    private func newFile(file: String, size: UInt64) {
        self.log(file + " [0 / \(size/1000)kb]")
    }
    
    private func fileProgress(file: String, current: Int) {
        print("\(file) \(current)")
        output = output.replacingOccurrences(of: "(\(file) \\[)([0-9]+)(\\s)", with: "$1\(Int(current/1000))$3", options: [.regularExpression])
    }
    
    private func download(file: SMBFile) -> Promise<URL> {
        newFile(file: file.name, size: file.fileSize)
        
        return samba.download(file: file, progress: { (bytes) in
            self.fileProgress(file: file.name, current: bytes)
        })
    }
    
    func sync() {
        log("Uploading flights...")
        logbook.upload(logbookApi: userSettings.targetURL, files: files, locationId: locations.selected).done { flights in
            self.log(flights.joined(separator: "\n"))
            self.log("DONE")
        }.catch { err in
            self.log(err.localizedDescription)
        }
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
