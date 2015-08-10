//
//  ReactPublisher.m
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Tokbox, Inc. All rights reserved.
//

#import "RCTViewManager.h"
#import <OpenTok/OpenTok.h>

#import "EvilDirtyHack.h"



@interface SuperAwesomeSubscriber: UIView<OTSubscriberDelegate> {
  NSString *_streamId;
  UIView *subscriberView;
}

@property (copy) NSString *streamId;
@property OTSubscriber *subscriber;

@end

@implementation SuperAwesomeSubscriber

- (NSString*)streamId {
  return _streamId;
}

- (void)setStreamId:(NSString *)streamId {
  if ([_streamId isEqualToString:streamId]) {
    return;
  }
  NSLog(@"setStreamId %@", streamId);
  _streamId = [streamId copy];
  if (subscriberView) {
    [subscriberView removeFromSuperview];
  }
  subscriberView = [self subscriberForStreamId:streamId].view;
  NSLog(@"how big am I? %f x %f", self.frame.size.width, self.frame.size.height);
  subscriberView.frame = CGRectMake(0, 0, self.frame.size.width, self.frame.size.height);
  [self addSubview:subscriberView];
}

- (OTSubscriber*)subscriberForStreamId:(NSString*)streamId {
  OTSession *session = [EvilDirtyHack sharedEvilDirtyHack].session;
  OTStream *stream = session.streams[streamId];
  NSLog(@"for streamId %@ we have %@", streamId, stream);
  self.subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];
  
  OTError *err = nil;
  [session subscribe:self.subscriber error:&err];
  
  if (err) {
    NSLog(@"FAIL! %@", err.localizedDescription);
    return nil;
  }
  
  return self.subscriber;
}

- (void)subscriberVideoDataReceived:(OTSubscriber *)subscriber {}

- (void)subscriberDidConnectToStream:(OTSubscriberKit *)subscriber {
  NSLog(@"subscriberDidConnectToStream hooray! %@", self);
}

- (void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
  NSLog(@"subscriber:didFailWithError:%@ hooray!", error.localizedDescription);
}

-(void)layoutSubviews {
  NSLog(@"how big am I? %f x %f", self.frame.size.width, self.frame.size.height);
  if (subscriberView) {    
    subscriberView.frame = CGRectMake(0, 0, self.frame.size.width, self.frame.size.height);
  }
}

@end


@interface ReactSubscriberManager : RCTViewManager

@end

@implementation ReactSubscriberManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(streamId, NSString)

- (UIView *)view
{
  EvilDirtyHack *sharedState = [EvilDirtyHack sharedEvilDirtyHack];
  
//  OTStream *foo = sharedState.session.streams[self.streamId];
  
  
//  OTSubscriber *foo = [[OTSubscriber alloc] initWithStream:stream delegate:self];
//
  
  return [[SuperAwesomeSubscriber alloc] init];
}

@end