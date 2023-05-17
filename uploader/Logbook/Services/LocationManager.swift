//
//  LocationService.swift
//  Logbook
//
//  Created by Juho Kolehmainen on 9.2.2020.
//  Copyright © 2020 Juho Kolehmainen. All rights reserved.
//

import Foundation
import CoreLocation

class LocationManager: NSObject, ObservableObject {

    static let shared = LocationManager()

    let manager = CLLocationManager()

    @Published var latest: CLLocationCoordinate2D?
    
    override init() {
        super.init()

        manager.delegate = self;
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    func requestLocation() {
        if CLLocationManager.locationServicesEnabled() {
            if manager.authorizationStatus == .notDetermined {
                manager.requestWhenInUseAuthorization()
            } else {
                manager.requestLocation()
            }
            print("Location requested")
        }
    }
}

extension LocationManager: CLLocationManagerDelegate {
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        switch status {
        case CLAuthorizationStatus.restricted:
            print("Restricted Access to location")
        case CLAuthorizationStatus.denied:
            print("User denied access to location")
            latest = nil
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

            manager.stopUpdatingLocation()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Failed to get location", error)
        latest = nil
    }
}

