//
//  EvilDirtyHack.h
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@class OTSession;
@class OTPublisher;

@interface EvilDirtyHack : NSObject

@property (nonatomic) OTSession *session;
@property (nonatomic) OTPublisher *publisher;
@property (nonatomic) NSMutableDictionary *subscriberHelpers;

+(instancetype)sharedEvilDirtyHack;
- (UIView*)viewForSubscriberId:(NSString*)subscriberId;

@end
