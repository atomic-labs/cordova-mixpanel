
#import <Cordova/CDV.h>
#import "MPTweakInline.h"

@interface CDVMixpanelTweaks: CDVPlugin
{
    NSDictionary *notificationMessage;
    BOOL    isInline;
    NSString *notificationCallbackId;
    
    BOOL ready;
}