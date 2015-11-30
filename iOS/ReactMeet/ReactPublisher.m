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

@interface ReactPublisherManager : RCTViewManager
@end

@interface TestView : UIView
@end

@implementation TestView
@end

@implementation ReactPublisherManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  EvilDirtyHack *sharedState = [EvilDirtyHack sharedEvilDirtyHack];
  UIView *publisherView = sharedState.publisher.view;
  return publisherView;
}

@end
