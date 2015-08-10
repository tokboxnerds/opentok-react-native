
//
//  EvilDirtyHack.m
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <OpenTok/OpenTok.h>
#import "EvilDirtyHack.h"
#import "SubscriberHelper.h"

@implementation EvilDirtyHack

+(instancetype)sharedEvilDirtyHack {
  static EvilDirtyHack *hack;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    hack = [[EvilDirtyHack alloc] init];
  });
  return hack;
}

- (instancetype)init {
  if (self = [super init]) {
    self.subscriberHelpers = [NSMutableDictionary dictionary];
  }
  return self;
}

- (UIView*)viewForSubscriberId:(NSString*)subscriberId {
  SubscriberHelper *helper = self.subscriberHelpers[subscriberId];
  return helper.subscriber.view;
}

@end
