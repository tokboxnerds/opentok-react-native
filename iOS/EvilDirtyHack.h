//
//  EvilDirtyHack.h
//  rntb
//
//  Created by Patrick Quinn-Graham on 10/8/2015.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@class OTSession;

@interface EvilDirtyHack : NSObject

@property (nonatomic) OTSession *session;
@property (strong, nonatomic) OTPublisher *publisher;

+(instancetype)sharedEvilDirtyHack;

@end
