import {AfterViewInit, Component, ElementRef, inject, NgZone, OnDestroy, Signal, viewChild} from '@angular/core';
import {Barcode, BarcodeFormat, BarcodeScanner, LensFacing, StartScanOptions} from '@capacitor-mlkit/barcode-scanning';
import {ModalController} from '@ionic/angular';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonButton} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {close} from 'ionicons/icons';
import {TEXTS} from '../constants/texts';
import {AlertService} from '../services/alert.service';

// modified https://github.com/robingenz/capacitor-mlkit-plugin-demo/blob/main/src/app/modules/barcode-scanning/barcode-scanning-modal.component.ts
@Component({
  selector: 'app-barcode-scanning',
  imports: [IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton],
  standalone: true,
  templateUrl: 'barcode-scanning-modal.component.html',
  styleUrl: 'barcode-scanning-modal.component.scss',
})
export class BarcodeScanningModalComponent implements AfterViewInit, OnDestroy {
  private alertService = inject(AlertService);
  private squareElement: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild('square', {read: ElementRef});
  private modalController = inject(ModalController);
  private ngZone = inject(NgZone);
  text = TEXTS.scanner;

  constructor() {
    addIcons({close})
  }

  public ngAfterViewInit(): void {
    setTimeout(async () => {
      await this.startScan();
    }, 500);
  }

  private async startScan(): Promise<void> {
    // Hide everything behind the modal (see `src/global.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: [BarcodeFormat.QrCode],
      lensFacing: LensFacing.Back,
    };

    const squareBBox = this.squareElement()?.nativeElement.getBoundingClientRect();

    const scaledRect = squareBBox
      ? {
        left: squareBBox.left * window.devicePixelRatio,
        right: squareBBox.right * window.devicePixelRatio,
        top: squareBBox.top * window.devicePixelRatio,
        bottom: squareBBox.bottom * window.devicePixelRatio,
        width: squareBBox.width * window.devicePixelRatio,
        height: squareBBox.height * window.devicePixelRatio,
      }
      : undefined;
    const detectionCorners = scaledRect
      ? [
        [scaledRect.left, scaledRect.top],
        [scaledRect.left + scaledRect.width, scaledRect.top],
        [scaledRect.left + scaledRect.width, scaledRect.top + scaledRect.height],
        [scaledRect.left, scaledRect.top + scaledRect.height],
      ]
      : undefined;

    const listener = await BarcodeScanner.addListener(
      'barcodeScanned',
      async (event) => {
        this.ngZone.run(() => {
          const cornerPoints = event.barcode.cornerPoints;
          if (detectionCorners && cornerPoints) {
            if (
              detectionCorners[0][0] > cornerPoints[0][0] ||
              detectionCorners[0][1] > cornerPoints[0][1] ||
              detectionCorners[1][0] < cornerPoints[1][0] ||
              detectionCorners[1][1] > cornerPoints[1][1] ||
              detectionCorners[2][0] < cornerPoints[2][0] ||
              detectionCorners[2][1] < cornerPoints[2][1] ||
              detectionCorners[3][0] > cornerPoints[3][0] ||
              detectionCorners[3][1] < cornerPoints[3][1]
            ) {
              return;
            }
          }
          listener.remove();
          this.closeModal(event.barcode);
        });
      },
    );

    try {
      await BarcodeScanner.startScan(options);
    } catch (e) {
      await this.closeModal();
      await this.alertService.info(this.text.permissionsError);
    }
  }

  public async closeModal(barcode?: Barcode): Promise<void> {
    await this.modalController.dismiss({
      barcode: barcode,
    });
  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');

    await BarcodeScanner.stopScan();
  }

  public ngOnDestroy(): void {
    this.stopScan();
  }
}
