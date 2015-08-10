//
//  OpenTokSessionManager.m
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Tokbox, Inc. All rights reserved.
//

#import <OpenTok/OpenTok.h>

#import "EvilDirtyHack.h"
#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#import "SubscriberHelper.h"

@interface OpenTokSessionManager : NSObject <RCTBridgeModule, OTSessionDelegate, OTPublisherDelegate>

@property (strong, nonatomic) RCTResponseSenderBlock connectCallback;

@property (readonly) EvilDirtyHack *sharedState;

@end

@implementation OpenTokSessionManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

- (EvilDirtyHack*)sharedState {
  return [EvilDirtyHack sharedEvilDirtyHack];
}

RCT_EXPORT_METHOD(initSession:(NSString*)apiKey sessionId:(NSString*)sessionId callback:(RCTResponseSenderBlock)callback) {
  self.sharedState.session = [[OTSession alloc] initWithApiKey:apiKey sessionId:sessionId delegate:self];
  callback(@[]);
}

RCT_EXPORT_METHOD(connect:(NSString*)token callback:(RCTResponseSenderBlock)callback) {
  OTError *err = nil;
  
  [self.sharedState.session connectWithToken:token error:&err];
  
  if (err) {
    callback(@[err.localizedDescription]);
  } else {
    self.connectCallback = callback;
  }
}

RCT_EXPORT_METHOD(initPublisher:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    self.sharedState.publisher = [[OTPublisher alloc] initWithDelegate:self];
    callback(@[]);
  });
}

RCT_EXPORT_METHOD(publishToSession:(RCTResponseSenderBlock)callback) {
  OTError *err;
  [self.sharedState.session publish:self.sharedState.publisher error:&err];
  if (err) {
    NSLog(@"Unable to publish (quick fail)");
    callback(@[ err.localizedDescription ]);
  } else {
    NSLog(@"Published (sorta may work a some point...?)");
    callback(@[]);
  }
}


RCT_EXPORT_METHOD(subscribeToStream:(NSString*)streamId callback:(RCTResponseSenderBlock)callback) {
  SubscriberHelper *helper = [[SubscriberHelper alloc] init];
  helper.completionHandler = callback;
  
  OTSession *session = [EvilDirtyHack sharedEvilDirtyHack].session;
  OTStream *stream = session.streams[streamId];

  [helper subscribeToStream:stream inSession:session];
  
  self.sharedState.subscriberHelpers[helper.uuid] = helper;
}

RCT_EXPORT_METHOD(unsubscribe:(NSString*)subscriberId callback:(RCTResponseSenderBlock)callback) {
  SubscriberHelper *helper = self.sharedState.subscriberHelpers[subscriberId];
  OTError *err = nil;
  [self.sharedState.session unsubscribe:helper.subscriber error:&err];
  if (err) {
    callback(@[err.localizedDescription]);
  } else {
    [self.sharedState.subscriberHelpers removeObjectForKey:subscriberId];
    callback(@[]);
  }
}

-(void)publisher:(OTPublisherKit *)publisher streamCreated:(OTStream *)stream {
  NSLog(@"publisher:streamCreated:");
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"publisherStreamCreated" body:@{ @"streamId": stream.streamId }];
}

-(void)publisher:(OTPublisherKit *)publisher streamDestroyed:(OTStream *)stream {
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"publisherStreamDestroyed" body:@{ @"streamId": stream.streamId }];
}

-(void)sessionDidConnect:(OTSession *)session {
  self.connectCallback(@[]);
  self.connectCallback = nil;
}

-(void)sessionDidDisconnect:(OTSession *)session {
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"sessionDidDisconnect" body:@{}];
}

-(void)session:(OTSession *)session streamCreated:(OTStream *)stream {
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"streamCreated" body:@{ @"foo": @"foobar", @"streamId": stream.streamId }];
}

-(void)session:(OTSession *)session didFailWithError:(OTError *)error {
  NSLog(@"session:didFailWithError: %@", error.localizedDescription);
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"sessionDidFailWithError" body:@{}];
}

-(void)session:(OTSession *)session streamDestroyed:(OTStream *)stream {
  [self.sharedState.subscriberHelpers.allValues enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
    SubscriberHelper *helper = obj;
    if ([helper.subscriber.stream.streamId isEqualToString:stream.streamId]) {

    }
  }];
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"streamDestroyed" body:@{ @"streamId": stream.streamId }];
}

-(void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
  NSLog(@"publisher:didFailWithError: %@", error.localizedDescription);
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"publisherDidFailWithError" body:@{ @"error": error.localizedDescription }];
}

@end
