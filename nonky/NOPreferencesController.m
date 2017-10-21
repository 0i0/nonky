//
//  NOPreferencesController.m
//  nonky
//
//  Created by Lior hakim on 10/13/17.
//  Copyright © 2017 Lior hakim. All rights reserved.
//

#import "NOPreferencesController.h"

@implementation NOPreferencesController {
    LSSharedFileListRef loginItems;
}

- (id)initWithWindowNibName:(NSString *)windowNibName
{
    self = [super initWithWindowNibName:windowNibName];
    if(self){
        LSSharedFileListAddObserver(loginItems,
                                    CFRunLoopGetMain(),
                                    kCFRunLoopCommonModes,
                                    loginItemsChanged,
                                    (__bridge void*)self);
    }
    return self;
}

- (IBAction)toggleLaunchAtStartup:(id)sender {
    // Toggle the state.
    BOOL shouldBeToggled = ![self isLaunchAtStartup];
    // Get the LoginItems list.
    LSSharedFileListRef loginItemsRef = LSSharedFileListCreate(NULL, kLSSharedFileListSessionLoginItems, NULL);
    if (loginItemsRef == nil) return;
    if (shouldBeToggled) {
        //self.launchAtLogin = YES;
        // Add the app to the LoginItems list.
        CFURLRef appUrl = (__bridge CFURLRef)[NSURL fileURLWithPath:[[NSBundle mainBundle] bundlePath]];
        LSSharedFileListItemRef itemRef = LSSharedFileListInsertItemURL(loginItemsRef, kLSSharedFileListItemLast, NULL, NULL, appUrl, NULL, NULL);
        if (itemRef) CFRelease(itemRef);
        
    }
    else {
        //self.launchAtLogin = NO;
        // Remove the app from the LoginItems list.
        LSSharedFileListItemRef itemRef = [self itemRefInLoginItems];
        LSSharedFileListItemRemove(loginItemsRef,itemRef);
        if (itemRef != nil) CFRelease(itemRef);
    }
    //[self.userDefaults setBool:self.launchAtLogin forKey:qDefaultLaunchAtLoginKey];
    CFRelease(loginItemsRef);
}
// MIT license
- (BOOL)isLaunchAtStartup {
    // See if the app is currently in LoginItems.
    LSSharedFileListItemRef itemRef = [self itemRefInLoginItems];
    // Store away that boolean.
    BOOL isInList = itemRef != nil;
    // Release the reference if it exists.
    if (itemRef != nil) CFRelease(itemRef);
    
    return isInList;
}
- (LSSharedFileListItemRef)itemRefInLoginItems {
    LSSharedFileListItemRef itemRef = nil;
    
    // Get the app's URL.
    NSURL *appUrl = [NSURL fileURLWithPath:[[NSBundle mainBundle] bundlePath]];
    // Get the LoginItems list.
    LSSharedFileListRef loginItemsRef = LSSharedFileListCreate(NULL, kLSSharedFileListSessionLoginItems, NULL);
    if (loginItemsRef == nil) return nil;
    // Iterate over the LoginItems.
    NSArray *loginItems = (__bridge NSArray *)LSSharedFileListCopySnapshot(loginItemsRef, nil);
    for (int currentIndex = 0; currentIndex < [loginItems count]; currentIndex++) {
        // Get the current LoginItem and resolve its URL.
        LSSharedFileListItemRef currentItemRef = (__bridge LSSharedFileListItemRef)[loginItems objectAtIndex:currentIndex];
        if ([appUrl isEqual:(__bridge id)(LSSharedFileListItemCopyResolvedURL(currentItemRef, 0, NULL))]) {
            // Save the LoginItem reference.
            itemRef = currentItemRef;
        }
    }
    // Retain the LoginItem reference.
    if (itemRef != nil) CFRetain(itemRef);
    // Release the LoginItems lists.
    //[loginItems release];
    CFRelease(loginItemsRef);
    
    return itemRef;
}

- (LSSharedFileListItemRef)getLoginItem
{
    CFArrayRef snapshotRef = LSSharedFileListCopySnapshot(loginItems, NULL);
    NSURL *bundleURL = [NSURL fileURLWithPath:[[NSBundle mainBundle] bundlePath]];
    
    LSSharedFileListItemRef itemRef = NULL;
    
    for (id item in (__bridge NSArray*)snapshotRef) {
        itemRef = (__bridge LSSharedFileListItemRef)item;
        if ([bundleURL isEqual:((__bridge NSURL *)LSSharedFileListItemCopyResolvedURL(itemRef, 0 , NULL))]) {
            CFRetain(itemRef);
            break;
        }
        itemRef = NULL;
    }
    
    CFRelease(snapshotRef);
    return itemRef;
}

static void loginItemsChanged(LSSharedFileListRef listRef, void *context)
{
//    NOPreferencesController *controller = (__bridge NOPreferencesController*)context;
//
//    [controller willChangeValueForKey:@"startAtLogin"];
//    [controller didChangeValueForKey:@"startAtLogin"];
}

- (IBAction)resetDefaults:(id)sender {
    NSUserDefaults * defs = [NSUserDefaults standardUserDefaults];
    NSDictionary * dict = [defs dictionaryRepresentation];
    for (id key in dict) {
        [defs removeObjectForKey:key];
    }
    [defs synchronize];
}
@end
