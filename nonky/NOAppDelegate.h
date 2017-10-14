//
//  AppDelegate.h
//  nonky
//
//  Created by Lior hakim on 10/13/17.
//  Copyright © 2017 Lior hakim. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface NOAppDelegate : NSObject <NSApplicationDelegate>

@property (weak) IBOutlet NSMenu *statusMenu;
@property (weak) IBOutlet NSMenu *templatesMenu;

@property BOOL *serverIsUp;

- (IBAction)showPreferences:(id)sender;
- (IBAction)tryToReconnect:(id)sender;
- (IBAction)openTemplatesDir:(id)sender;

@end

