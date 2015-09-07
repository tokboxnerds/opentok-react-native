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
@property (strong, nonatomic) RCTResponseSenderBlock disconnectCallback;

@property (readonly) EvilDirtyHack *sharedState;

@end

@implementation OpenTokSessionManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

- (EvilDirtyHack*)sharedState {
  return [EvilDirtyHack sharedEvilDirtyHack];
}

#pragma mark - Session API for react

RCT_EXPORT_METHOD(initSession:(NSString*)apiKey sessionId:(NSString*)sessionId callback:(RCTResponseSenderBlock)callback) {
  // TODO: If already connected, error!
  self.sharedState.session = [[OTSession alloc] initWithApiKey:apiKey sessionId:sessionId delegate:self];
  [self.sharedState.session performSelector:@selector(setApiRootURL:) withObject:[NSURL URLWithString:@"https://anvil-tbdev.opentok.com"]];
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

RCT_EXPORT_METHOD(disconnect:(RCTResponseSenderBlock)callback) {
  OTError *err = nil;
  
  [self.sharedState.session disconnect:&err];
  [self.sharedState.subscriberHelpers removeAllObjects];
  
  if (err) {
    callback(@[err.localizedDescription]);
  } else {
    self.disconnectCallback = callback;
  }
}

// TODO: setApiRootUR

#pragma mark - Publisher API for react

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

RCT_EXPORT_METHOD(setPublishVideo:(BOOL)publishVideo callback:(RCTResponseSenderBlock)callback) {
  if (self.sharedState.publisher == nil) {
    callback(@[@"You cannot set publishVideo without publishing first."]);
    return;
  }
  self.sharedState.publisher.publishVideo = publishVideo;
  callback(@[]);
}

RCT_EXPORT_METHOD(setPublishAudio:(BOOL)publishAudio callback:(RCTResponseSenderBlock)callback) {
  if (self.sharedState.publisher == nil) {
    callback(@[@"You cannot set publishAudio without publishing first."]);
    return;
  }
  self.sharedState.publisher.publishAudio = publishAudio;
  callback(@[]);
}

RCT_EXPORT_METHOD(setPublisherCameraPosition:(NSString*)cameraPosition callback:(RCTResponseSenderBlock)callback) {
  if (self.sharedState.publisher == nil) {
    callback(@[@"You cannot set publishAudio without publishing first."]);
    return;
  }
  
  if ([cameraPosition isEqualToString:@"front"]) {
    self.sharedState.publisher.cameraPosition = AVCaptureDevicePositionFront;
    callback(@[]);
    
  } else if ([cameraPosition isEqualToString:@"back"]) {
    self.sharedState.publisher.cameraPosition = AVCaptureDevicePositionBack;
    callback(@[]);
    
  } else if ([cameraPosition isEqualToString:@"unspecified"]) {
    self.sharedState.publisher.cameraPosition = AVCaptureDevicePositionUnspecified;
    callback(@[]);
    
  } else {
    callback(@[@"Unexpectedc camera position, use front, back or unspecified."]);
  }
}

RCT_EXPORT_METHOD(publisherCameraPosition:(RCTResponseSenderBlock)callback) {
  if (self.sharedState.publisher == nil) {
    callback(@[@"You cannot set publishAudio without publishing first."]);
    return;
  }
  
  NSString *position;
  switch (self.sharedState.publisher.cameraPosition) {
    case AVCaptureDevicePositionBack:
      position = @"back";
      break;
      
    case AVCaptureDevicePositionFront:
      position = @"front";
      break;
      
    case AVCaptureDevicePositionUnspecified:
      position = @"unspecified";
      break;
  }
  
  callback(@[NSNull.null, position]);
}

#pragma mark - Subscriber API for react

RCT_EXPORT_METHOD(subscribeToStream:(NSString*)streamId callback:(RCTResponseSenderBlock)callback) {
  SubscriberHelper *helper = [[SubscriberHelper alloc] init];
  helper.completionHandler = callback;
  
  OTSession *session = [EvilDirtyHack sharedEvilDirtyHack].session;
  OTStream *stream = session.streams[streamId];

  NSLog(@"Attempting to subscribe to %@ (%@) in %@", streamId, stream, session);
  
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

RCT_EXPORT_METHOD(setSubscribeToVideo:(BOOL)subscribeToVideo forSubscriber:(NSString*)subscriberId callback:(RCTResponseSenderBlock)callback) {
  SubscriberHelper *helper = self.sharedState.subscriberHelpers[subscriberId];
  
  if (helper == nil) {
    callback(@[@"Subscriber not found."]);
    return;
  }
  
  helper.subscriber.subscribeToVideo = subscribeToVideo;
  callback(@[]);
}

RCT_EXPORT_METHOD(setSubscribeToAudio:(BOOL)subscribeToAudio forSubscriber:(NSString*)subscriberId callback:(RCTResponseSenderBlock)callback) {
  SubscriberHelper *helper = self.sharedState.subscriberHelpers[subscriberId];
  
  if (helper == nil) {
    callback(@[@"Subscriber not found."]);
    return;
  }
  
  helper.subscriber.subscribeToAudio = subscribeToAudio;
  callback(@[]);
}

// TODO: subscribeToVideo`, `subscribeToAudio

#pragma mark - OTSessionDelegate methods

-(void)sessionDidConnect:(OTSession *)session {
  self.connectCallback(@[]);
  self.connectCallback = nil;
}

-(void)sessionDidDisconnect:(OTSession *)session {
  if (self.disconnectCallback) {
    self.disconnectCallback(@[]);
    self.disconnectCallback = nil;
  }
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

// TODO: subscriber/stream destroyed events when the session disconnects so we clean up 

#pragma mark - OTPublisherDelegate methods

-(void)publisher:(OTPublisherKit *)publisher streamCreated:(OTStream *)stream {
  NSLog(@"publisher:streamCreated:");
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"publisherStreamCreated" body:@{ @"streamId": stream.streamId }];
}

-(void)publisher:(OTPublisherKit *)publisher streamDestroyed:(OTStream *)stream {
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"publisherStreamDestroyed" body:@{ @"streamId": stream.streamId }];
}

-(void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
  NSLog(@"publisher:didFailWithError: %@", error.localizedDescription);
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"publisherDidFailWithError" body:@{ @"error": error.localizedDescription }];
}

@end
