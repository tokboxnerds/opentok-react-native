//
//  SubscriberHelper.h
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <OpenTok/OpenTok.h>
#import "RCTBridgeModule.h"

@interface SubscriberHelper : NSObject <OTSubscriberDelegate>

@property (strong) RCTResponseSenderBlock completionHandler;
@property OTSubscriber *subscriber;
@property NSString *uuid;

- (void)subscribeToStream:(OTStream*)stream inSession:(OTSession*)session;

@end
