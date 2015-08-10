
//
//  EvilDirtyHack.m
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <OpenTok/OpenTok.h>
#import "EvilDirtyHack.h"

@implementation EvilDirtyHack

+(instancetype)sharedEvilDirtyHack {
  static EvilDirtyHack *hack;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    hack = [[EvilDirtyHack alloc] init];
  });
  return hack;
}
//
//- (OTSubscriber*)subscriberForStream:(NSString*)stringId {
//  OTSubscriber *subscrber = [OTSubscriber ]
//}

@end
