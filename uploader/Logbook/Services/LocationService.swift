//
//  LocationService.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 9.2.2020.
//  Copyright © 2020 Juho Kolehmainen. All rights reserved.
//

import Foundation
import CoreLocation

class LocationService: NSObject, CLLocationManagerDelegate {
    
    let manager = CLLocationManager()
    
    var fulfill: ((CLLocationCoordinate2D) -> Void)?
    var reject: ((String) -> Void)?
    
    var latest: CLLocationCoordinate2D?
    
    override init() {
        super.init()
    }

    func requestLocation(fulfill: @escaping (CLLocationCoordinate2D) -> Void, reject: @escaping (String) -> Void) {
        self.fulfill = fulfill
        self.reject = reject

        if CLLocationManager.locationServicesEnabled() {
            manager.delegate = self;
            manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            
            if CLLocationManager.authorizationStatus() == .notDetermined {
                manager.requestWhenInUseAuthorization()
            } else {
                manager.requestLocation()
            }
            print("Location requested")
        } else {
            reject("Location not enabled")
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        switch status {
        case CLAuthorizationStatus.restricted:
            print("Restricted Access to location")
        case CLAuthorizationStatus.denied:
            print("User denied access to location")
            reject?("Location not allowed")
        case CLAuthorizationStatus.notDetermined:
            print("Status not determined")
        default:
            print("Looking for location with status \(status)")
            manager.requestLocation()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.last {
            let eventDate = location.timestamp
            let howRecent = abs(eventDate.timeIntervalSinceNow)
            print("Got location with accuracy \(location.horizontalAccuracy) is \(howRecent) old");
            
            latest = location.coordinate
            fulfill?(location.coordinate)
            
            manager.stopUpdatingLocation()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Failed to get location", error)
        reject?("Failed to get location")
    }
}

