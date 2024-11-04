import {Component, OnInit} from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import {Keyboard, KeyboardResize} from "@capacitor/keyboard";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() === 'ios') {
        // Only change style for iOS. On Android there is always a black background under notifications bar as the app
        // is not running in fullscreen mode.
        await StatusBar.setStyle({style: Style.Dark});

        // Setting resize mode is only supported on iOS
        await Keyboard.setResizeMode({mode: KeyboardResize.None});
      }
    }
  }
}
