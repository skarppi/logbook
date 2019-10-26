//
//  ViewController.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 09.02.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import UIKit
import PromiseKit
import SMBClient

class ViewController: UIViewController {

    @IBOutlet weak var smbName: UITextField!
    
    @IBOutlet weak var logbookApiUrl: UITextField!
    
    @IBOutlet weak var splitFlightsAfterSeconds: UITextField!
    
    @IBOutlet weak var statusLabel: UILabel!
    
    @IBOutlet weak var refreshButton: UIButton!
    
    @IBOutlet weak var syncButton: UIButton!
    
    private var samba: SambaClient!
    
    private var logbook = LogbookService()
    
    private var sdCard: SdCardService!
    
    private var files: [URL] = []
    
    private var lastSync: Date?
    
    private let SMB_PREFIX = "smb://"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if let smbName = UserDefaults.standard.string(forKey: "smbName") {
            self.smbName.text = smbName
        }
        
        if let logbookApiUrl = UserDefaults.standard.string(forKey: "logbookApiUrl") {
            self.logbookApiUrl.text = logbookApiUrl
        }
        
        if let splitFlightsAfterSeconds = UserDefaults.standard.string(forKey: "splitFlightsAfterSeconds") {
            self.splitFlightsAfterSeconds.text = splitFlightsAfterSeconds
        }
    }
    
    @IBAction func saveSmbName() {
        UserDefaults.standard.set(self.smbName.text!, forKey: "smbName")
        UserDefaults.standard.synchronize()
    }
    
    @IBAction func saveLogbookApiUrl() {
        UserDefaults.standard.set(self.logbookApiUrl.text!, forKey: "logbookApiUrl")
        UserDefaults.standard.synchronize()
    }

    @IBAction func saveSplitFlightsAfterSeconds() {
        UserDefaults.standard.set(self.splitFlightsAfterSeconds.text!, forKey: "splitFlightsAfterSeconds")
        UserDefaults.standard.synchronize()
    }
    
    private func log(_ text: String) {
        if let existing = statusLabel.text {
            statusLabel.text = "\(existing)\n\(text)"
        } else {
            statusLabel.text = text
        }
    }
    
    private func fileProgress(file: String, current: Int) {
        print("\(file) \(current)")
        if let text = statusLabel.text {
            statusLabel.text = text.replacingOccurrences(of: "(\(file) \\[)([0-9]+)(\\s)", with: "$1\(current)$3", options: [.regularExpression])
        }
    }
    
    private func fetchNewFiles(after: Date) {
        self.log("Fetching new log files...")
        samba?.query(after: after).done { files in
            guard files.count > 0 else {
                self.log("No new flights")
                return
            }
            
            let promises = files.compactMap { file in self.download(file: file) }
            
            firstly {
                when(fulfilled: promises)
            }.done { files in
                self.syncButton.isEnabled = true
                self.files = files
            }
        }.catch { error in
            self.log(error.localizedDescription)
        }
        
        sdCard?.query(after: after).done { files in
            guard files.count > 0 else {
                self.log("No new flights")
                return
            }
            files.forEach { url in
                let keys = Set([URLResourceKey.fileSizeKey])
                guard let resourceValues = try? url.resourceValues(forKeys: Set(keys)),
                    let size = resourceValues.fileSize
                    else {
                        print("No properties for file \(url.path)")
                        return
                }
                
                self.log(url.lastPathComponent + " [\(size/1000)kb]")
            }
            self.syncButton.isEnabled = true
            self.files = files
        }.catch { error in
            self.log(error.localizedDescription)
        }

    }
    
    private func download(file: SMBFile) -> Promise<URL> {
        self.log(file.name + " [0 / \(file.fileSize/1000)kb]")
        
        return self.samba!.download(file: file, progress: { (bytes) in
            self.fileProgress(file: file.name, current: Int(bytes/1000))
        })
    }
    
    @IBAction func refresh() {
        self.files = []
        self.syncButton.isEnabled = false
        
        let dateFormatter = DateFormatter()
        dateFormatter.timeZone = TimeZone.current
        dateFormatter.dateStyle = DateFormatter.Style.long
        dateFormatter.timeStyle = DateFormatter.Style.medium

        let path = self.smbName.text!
        
        if path.starts(with: SMB_PREFIX) {
            samba = SambaClient(hostname: String(path.dropFirst(SMB_PREFIX.count)))
            
            if samba !== nil {
                statusLabel.text = "Connected to \(path) (\(samba.server.ipAddressString))"
            } else {
                statusLabel.text = "Unable to connect to \(path)"
            }
        } else {
            sdCard = SdCardService()
            
            if let bookMark = Bookmark.read() {
                if bookMark.lastPathComponent != path {
                    sdCard.open(self)
                }
            } else {
                sdCard.open(self)
            }
        }
        
        logbook.fetchLatestFlight(logbookApi: self.logbookApiUrl.text!).done { date in
            let lastSync: Date = date ?? Date(timeIntervalSince1970: 0)

            if let date = date {
                self.log("Last flight \(dateFormatter.string(from: date))")
            } else {
                self.log("No previous flights")
            }
            
            self.lastSync = lastSync
        }.catch { error in
            self.log(error.localizedDescription)
        }.finally {
            if let lastSync = self.lastSync {
                self.fetchNewFiles(after: lastSync)
            }
        }
    }
    
    @IBAction func sync() {
        self.log("Uploading flights...")
        let split = self.splitFlightsAfterSeconds.text ?? ""
        logbook.upload(logbookApi: self.logbookApiUrl.text!, files: self.files, splitAfterSeconds: Int(split) ?? 30).done { flights in
            self.log(flights.joined(separator: "\n"))
            self.log("DONE")
        }
    }
}

extension ViewController: UITextFieldDelegate {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}

extension ViewController: UIDocumentPickerDelegate {
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let url = urls.first,
            url.startAccessingSecurityScopedResource() else {
                print("Bookmarking failed to open security")
                return
        }
        defer { url.stopAccessingSecurityScopedResource() }
        
        if let url = Bookmark.write(url: url) {
            statusLabel.text = "Selected folder \(url.lastPathComponent)"
            self.smbName.text = url.lastPathComponent
            saveSmbName()
            
            refresh()
        } else {
            statusLabel.text = "No selection"
        }
    }
}
