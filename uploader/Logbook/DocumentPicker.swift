//
//  DocumentPicker.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 26.10.2019.
//  Copyright © 2019 Juho Kolehmainen. All rights reserved.
//

import SwiftUI
import UIKit
import MobileCoreServices
import Combine

struct DocumentPickerView: UIViewControllerRepresentable {
    
    @Binding var model: DocumentPickerViewModel
    
    var sdCardService = SdCardService()
    
    @EnvironmentObject var userSettings: UserSettings
        
    typealias UIViewControllerType = UIDocumentPickerViewController
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let types = [kUTTypeFolder as String]
        let controller = UIDocumentPickerViewController(documentTypes: types, in: .open)
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {
    }
    
    class Coordinator: NSObject, UIDocumentPickerDelegate, UINavigationControllerDelegate {
        var parentView: DocumentPickerView

        init(_ pageViewController: DocumentPickerView) {
            self.parentView = pageViewController
        }
        
        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            
            guard let url = urls.first,
                url.startAccessingSecurityScopedResource() else {
                    print("Bookmarking failed to open security")
                    return
            }
            defer { url.stopAccessingSecurityScopedResource() }
            
            if let url = Bookmark.write(url: url) {
                parentView.model.pickedDocumentSubject?.send(url)
                parentView.model.isPresented = false
            }
        }
    }

}

struct DocumentPickerViewModel {
    var isPresented: Bool = false
    let pickedDocumentSubject: PassthroughSubject<URL, Never>! = PassthroughSubject<URL, Never>()
}
