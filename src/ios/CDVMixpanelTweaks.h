
#import <Cordova/CDV.h>
#import "MPTweakInline.h"

@interface CDVMixpanelTweaks: CDVPlugin
{
    BOOL ready;
}

-(void)init:(CDVInvokedUrlCommand *)command;

@end