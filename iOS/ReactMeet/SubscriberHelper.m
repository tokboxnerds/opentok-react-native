//
//  SubscriberHelper.m
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "SubscriberHelper.h"
@implementation SubscriberHelper

- (instancetype)init {
  if (self = [super init]) {
    CFUUIDRef uuid = CFUUIDCreate(nil);
    self.uuid = (__bridge NSString *)(CFUUIDCreateString(nil, uuid));
  }
  return self;
}

- (void)subscribeToStream:(OTStream*)stream inSession:(OTSession*)session {
  self.subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];
  
  OTError *err = nil;
  [session subscribe:self.subscriber error:&err];
  
  if (err) {
    NSLog(@"SubscriberHelper %@ failed: %@", stream, err.localizedDescription);
    self.completionHandler(@[err.localizedDescription]);
    return;
  }
}

- (void)subscriberVideoDataReceived:(OTSubscriber *)subscriber {}

- (void)subscriberDidConnectToStream:(OTSubscriberKit *)subscriber {
  NSLog(@"subscriberDidConnectToStream hooray! %@", self);
  self.completionHandler(@[NSNull.null, self.uuid]);
}

- (void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
  NSLog(@"subscriber:didFailWithError:%@ hooray!", error.localizedDescription);
  self.completionHandler(@[error.localizedDescription]);
}

@end
