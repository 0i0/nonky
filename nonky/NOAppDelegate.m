//
//  AppDelegate.m
//  nonky
//
//  Created by Lior hakim on 10/13/17.
//  Copyright © 2017 Lior hakim. All rights reserved.
//

#import "NOAppDelegate.h"
#import "NOWindow.h"
#import "NOPreferencesController.h"
#include <CoreServices/CoreServices.h>

static NSString *const qBaseUrlValue = @"http://localhost:26498";
static NSString *const qDefaultTemplates = @"default-templates";

@interface NOAppDelegate ()

@end

@implementation NOAppDelegate{
    NSStatusItem* statusItem;
    NSArray *templatesArray;
    NOPreferencesController* preferences;
    NSMutableDictionary *windows;
    NSUserDefaults *userDefaults;
    NSMutableDictionary *defaultTemplates;
    BOOL isServerUP;
    NSTask *task;
    NSString *templatesPath;
    FSEventStreamRef stream;
}

@synthesize statusMenu;
@synthesize templatesMenu;


- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    templatesPath = [NSString stringWithFormat:@"%@/%@", NSHomeDirectory(), @"/Library/Application Support/nonky/public/templates/"];
    [self createAppDirectory];
    [self startServer];
    windows = [[NSMutableDictionary alloc] initWithCapacity:10];
    userDefaults = [NSUserDefaults standardUserDefaults];
    [self setDefaultsIfNecessary];
    defaultTemplates = [[userDefaults objectForKey:qDefaultTemplates] mutableCopy];
    statusItem = [self addStatusItemToMenu: statusMenu];
    preferences = [[NOPreferencesController alloc]initWithWindowNibName:@"Preferences"];
    [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(getTemplatesWithRetryCounter:) userInfo:@(5) repeats:NO];
    [self initializeEventStream];

}
-(void)setDefaultsIfNecessary{
    if ([userDefaults objectForKey:qDefaultTemplates] == nil) {
        NSDictionary *DefaultTemplates = [[NSDictionary alloc] initWithObjectsAndKeys:@"YES",@"jquery", nil];
        [userDefaults setObject:DefaultTemplates forKey:qDefaultTemplates];
    }
}
- (NSStatusItem*)addStatusItemToMenu:(NSMenu*)menu
{
    NSStatusItem *statusItem = [[NSStatusBar systemStatusBar] statusItemWithLength:NSVariableStatusItemLength];
    
    NSImage *image = [[NSBundle mainBundle] imageForResource:@"status-icon"];
    [statusItem setImage: image];
    statusItem.highlightMode = YES;
    statusItem.menu = menu;
    [statusItem setEnabled:YES];
    return statusItem;
}


- (void)applicationWillTerminate:(NSNotification *)aNotification {
   [[NSStatusBar systemStatusBar] removeStatusItem:statusItem];
   [task terminate];
}

-(void)createAppDirectory{
    BOOL isDir;
    NSFileManager *fileManager= [NSFileManager defaultManager];
    NSBundle *thisBundle = [NSBundle mainBundle];
    NSString *executableName = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleExecutable"];
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
    NSString *userpath = [paths objectAtIndex:0];
    if(![fileManager fileExistsAtPath:userpath isDirectory:&isDir])
        if(![fileManager createDirectoryAtPath:userpath withIntermediateDirectories:YES attributes:nil error:NULL])
            NSLog(@"Error: Create folder failed %@", userpath);
    userpath = [userpath stringByAppendingPathComponent:executableName];    // The file will go in this directory
    NSString *savePath = [userpath stringByAppendingPathComponent:@"public"];

    if ([fileManager fileExistsAtPath:userpath] == NO){
        [fileManager createDirectoryAtPath:userpath withIntermediateDirectories:YES attributes:nil error:nil];
        [fileManager copyItemAtPath:[thisBundle pathForResource:@"public" ofType:nil] toPath:savePath error:NULL];
    }
}
-(void)startServer{
    task = [[NSTask alloc] init];
    [task setLaunchPath:[[NSBundle mainBundle] pathForResource:@"app-macos" ofType:nil]];

    NSPipe *temppipe = [NSPipe pipe];
    [task setStandardOutput:temppipe];
    NSPipe *errorPipe = [NSPipe pipe];
    [task setStandardError:errorPipe];

    [task launch];

//    NSData *dataErr = [[errorPipe fileHandleForReading] readDataToEndOfFile];
//    NSString *resultErr = [[NSString alloc] initWithData:dataErr encoding:NSUTF8StringEncoding];
//    NSLog(@"%@", resultErr);
}
- (IBAction)openTemplatesDir:(id)sender{
    NSURL *folderURL = [NSURL fileURLWithPath:templatesPath];
    [[NSWorkspace sharedWorkspace] openURL: folderURL];
}
- (IBAction)showPreferences:(id)sender
{
    [preferences showWindow:nil];
    [NSApp activateIgnoringOtherApps:YES];
    [preferences.window makeKeyAndOrderFront:self];
}

-(void)getTemplatesWithRetryCounter:(int) retryCounter{
    if (retryCounter == 0) {
        return;
    }
    retryCounter--;
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    [request setURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@%@", qBaseUrlValue, @"/api/templates"]]];
    [request setHTTPMethod:@"GET"];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            NSLog(@"dataTaskWithRequest error: %@", error);
            NSLog(@"retry: %@", @(retryCounter));
        }else{
            templatesArray = [NSJSONSerialization JSONObjectWithData:data
                                                             options:kNilOptions
                                                               error:&error];
            dispatch_async(dispatch_get_main_queue(), ^{
                for( NSMenuItem *item in [templatesMenu itemArray] ){
                    [templatesMenu removeItem:item];
                }
                NSMutableArray *deletedTempltes=[[NSMutableArray alloc] init];
                for (id key in defaultTemplates){
                    if(![templatesArray containsObject:key]){
                        [deletedTempltes addObject:key];
                    }
                }
                for (id key in deletedTempltes) {
                    [defaultTemplates removeObjectForKey:key];
                }
                for (id object in templatesArray) {
                    NSMenuItem *menuItem = [[NSMenuItem alloc] initWithTitle:object action:@selector(toggleLoadTemplate:) keyEquivalent:@""];
                    [templatesMenu addItem:menuItem];
                    NSString *defaultActiveState = [defaultTemplates objectForKey:object];
                    if([defaultActiveState boolValue]){
                        [menuItem setState:NSOnState];
                    }else{
                        [menuItem setState:NSOffState];
                    }
                }
                [self loadTemplatesFromDictionary:defaultTemplates];
            });
        }
    }] resume];
    
}
- (IBAction)tryToReconnect:(id)sender{
    [self getTemplatesWithRetryCounter:5];
}
- (void)toggleLoadTemplate:(id)sender{
    if([sender state]==NSOffState){
        [sender setState:NSOnState];
        NSString* templateName = [(NSMenuItem*)sender title];
        [self storeTemplateDefaultActiveStateWithName:templateName andState:YES];
        [self loadTemplateWithName:templateName];
    }else{
        [sender setState:NSOffState];
        NSString* templateName = [(NSMenuItem*)sender title];
        [self storeTemplateDefaultActiveStateWithName:templateName andState:NO];
        [windows removeObjectForKey:templateName];
    }
}
-(void)storeTemplateDefaultActiveStateWithName:(NSString *)templateName andState:(BOOL)active{
    NSString *activeString = active ? @"YES" : @"NO";
    [defaultTemplates setValue:activeString forKey:templateName];
    NSDictionary *DefaultTemplatesStatic = [NSDictionary dictionaryWithDictionary:defaultTemplates];
    [userDefaults setObject:DefaultTemplatesStatic forKey:qDefaultTemplates];
}
-(void)loadTemplatesFromDictionary:(NSDictionary *) dictionary{
    [dictionary enumerateKeysAndObjectsWithOptions:NSEnumerationConcurrent usingBlock:^(id key, id object, BOOL *stop) {
         if([object boolValue]){
             NSLog(@"%@-%@",key,object);
             [self loadTemplateWithName:key];
         }
    }];
}
- (IBAction)ReloadAll:(id)sender{
    [self getTemplatesWithRetryCounter:4];
}

-(void)loadTemplateWithName:(NSString *)templateName{
    NSString* templateURL = [NSString stringWithFormat:@"%@%@%@", qBaseUrlValue,@"/templates/", templateName];
    [windows removeObjectForKey:templateName];
    dispatch_async(dispatch_get_main_queue(), ^{
        NOWindow *window = [[NOWindow alloc] init];
        [windows setObject:window forKey:templateName];
        [window loadUrl:[NSURL URLWithString:templateURL]];
        [window makeKeyAndOrderFront:self];
    });
}

static void fsEventsCallback(ConstFSEventStreamRef streamRef, void *clientCallBackInfo, size_t numEvents, void *eventPaths, const FSEventStreamEventFlags eventFlags[], const FSEventStreamEventId eventIds[]);

- (void)initializeEventStream {
    NSArray *pathsToWatch = [NSArray arrayWithObject:templatesPath];
    FSEventStreamContext context;
    context.info = (__bridge void * _Nullable)(self);
    context.version = 0;
    context.retain = NULL;
    context.release = NULL;
    context.copyDescription = NULL;
    stream = FSEventStreamCreate(NULL, mycallback, &context, (__bridge CFArrayRef)pathsToWatch, kFSEventStreamEventIdSinceNow, 1.0, kFSEventStreamCreateFlagWatchRoot);
    FSEventStreamScheduleWithRunLoop(stream, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
    FSEventStreamStart(stream);
    
}

void mycallback(
                ConstFSEventStreamRef streamRef,
                void *clientCallBackInfo,
                size_t numEvents,
                void *eventPaths,
                const FSEventStreamEventFlags eventFlags[],
                const FSEventStreamEventId eventIds[])
{
    [((__bridge NOAppDelegate*)clientCallBackInfo) getTemplatesWithRetryCounter:4];
}
@end
