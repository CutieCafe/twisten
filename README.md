# Twisten
Listen to Twitch.tv streams over Discord voice chat

## Install
### Use the hosted version
If you're not interested in setup, Cutie Café provides a hosted version of Twisten.
Visit http://twisten.cutie.cafe/ for more information.

### Manual installation
```
git clone https://github.com/antigravities/twisten
cd twisten
sudo apt install -y ffmpeg build-essential # Or your distribution equivalent
npm i
cp config.json.example config.json
$EDITOR config.json
npm start
```

## Use
```
twisten [twitch channel] - Listen to a Twitch channel.
twisten stop - Stop the stream. Note that you can only stop the stream if you've started it, or you have the Mute Members permission in the target guild.
twisten help - Show a help message.
twisten info - Show information about the current stream.
```

## License
```
Listen to Twitch.tv streams over Discord voice chat
Copyright (C) 2018 Cutie Café

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```