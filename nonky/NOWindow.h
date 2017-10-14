//
//  NOWindow.h
//  nonky
//
//  Created by Lior hakim on 10/13/17.
//  Copyright © 2017 Lior hakim. All rights reserved.
//
#import <Cocoa/Cocoa.h>
@import WebKit;

@interface NOWindow : NSWindow

@property (strong, readonly) NSView* view;

- (id)init;
//- (void)loadUrl:(NSURL*)url;
//- (void)reload;
- (void)loadUrl:(NSURL*)url;
@end
