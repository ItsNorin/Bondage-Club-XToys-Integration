# Bondage Club XToys Integration
Made for controlling irl toys  based on your in game character's worn toys, as well as interactions with other players inside chat rooms.

### Find me online for help or to see updates, report issues, mention any improvements you'd want, or just chat:
https://discord.gg/2VxqbbrUW8

## Usage
1. Install Tampermonkey extension, add BCXToys.user.js as a userscript.
2. Go to https://xtoys.app/scripts/-NKBBRsS_zPuUags3DNb and press "Load Script".
3. Open Bondage club site, copy the Webhook ID from the XToys script into the prompt that should pop up.
4. Modify script's config JSON to your liking, see contents of XToys Script Config Exmples.

## Config Overview
In the general use XToys script, you can create your own configs to change how your toys react. Check the console for any errors with your config. Once done editing, press the Update button or reload the script.

#### Toy Events
Tag        | Value
-----------|---
Name       | Name of the slot that the toy is in.
Weight     | How heavily weighted the output of the toy is compared to other toys when multiple in game toys are to be mixed into one irl toy. Doesn't mean anything if just one toy slot is defined in the configs as shown in the example config.
RampTimeMS | Amount of milliseconds it will take for the toy to reach the desired value

#### Vibe Intensity
In game, each vibrating toy has 5 states, off, low, medium, high, maximum. A config of [ 0, 0.25, 0.5, 0.75, 1] will make the toy give 0 output when off and 50% when medium. This will scale so that maximum is always 100%.

#### Actions
When an action happens in game, the script will work its way down the list you define in the actions config until it finds a match. It will then ramp up to its given intensity, ramping back down after it expires. The script can handle up to 5 concurrent actions, who's effect is additive (for now). Each action config element must have the following

Tag        | Value
-----------|---
Type       | Whether the action is being done to you, "OnSelf" or by you on another, "OnOther". 
Intensity  | A number between 0 and 100
DurationMS | How long the action should have an output in milliseconds
RampTimeMS | How long until the action reaches its defined intensity
Names      | An array of slot names on which this action will work. Use * to match with any slot.
Actions    | An array of action names that will work. Use * to match with any action.
Items      | An array of held items that will work. Use * to match with any item.


## Notes & Support
This is still in development and may not even work. If you want to try to use it now, be prepared to figure some things out lmao
