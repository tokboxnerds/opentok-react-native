//
//  ReactPublisher.m
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Tokbox, Inc. All rights reserved.
//

#import "RCTViewManager.h"

#import "EvilDirtyHack.h"
#import "SubscriberHelper.h"

@interface ReactSubscriberView: UIView {
  NSString *_subscriberId;
  UIView *subscriberView;
}

@property (copy) NSString *subscriberId;

@end

@implementation ReactSubscriberView

- (NSString*)subscriberId {
  return _subscriberId;
}

- (void)setSubscriberId:(NSString *)subscriberId {
  if ([_subscriberId isEqualToString:subscriberId]) {
    return;
  }
  NSLog(@"setSubscriberId %@", subscriberId);
  _subscriberId = [subscriberId copy];
  if (subscriberView) {
    [subscriberView removeFromSuperview];
  }
  
  subscriberView = [[EvilDirtyHack sharedEvilDirtyHack] viewForSubscriberId:subscriberId];

  subscriberView.frame = CGRectMake(0, 0, self.frame.size.width, self.frame.size.height);
  [self addSubview:subscriberView];
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

RCT_EXPORT_VIEW_PROPERTY(subscriberId, NSString)

- (UIView *)view
{
  return [[ReactSubscriberView alloc] init];
}

@end