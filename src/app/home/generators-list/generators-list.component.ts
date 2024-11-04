import {ApplicationRef, Component, computed, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {IonicModule, ToastController} from '@ionic/angular';
import {Clipboard} from '@capacitor/clipboard';
import {addIcons} from 'ionicons';
import {createOutline, trashOutline} from 'ionicons/icons';
import {toObservable} from '@angular/core/rxjs-interop';
import {Subscription} from 'rxjs';
import {PersistenceService} from 'src/app/services/persistence.service';
import {OtpGeneratorsService} from 'src/app/services/otp-generators.service';
import {TEXTS} from 'src/app/constants/texts';
import {AlertService} from 'src/app/services/alert.service';
import {ModalService} from 'src/app/services/modal-service';
import {ManualEnterModalComponent} from 'src/app/manual-enter-modal/manual-enter-modal.component';
import {GeneratorData} from "../../models/model";

@Component({
  selector: 'app-generators-list',
  templateUrl: './generators-list.component.html',
  styleUrls: ['./generators-list.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class GeneratorsListComponent implements OnInit, OnDestroy {
  private persistenceService = inject(PersistenceService);
  private otpGeneratorsService = inject(OtpGeneratorsService);
  private toastController = inject(ToastController);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private appRef = inject(ApplicationRef);
  text = TEXTS.list;

  private timerInterval: any;
  private subscription: Subscription;

  generators = signal<GeneratorData[]>([]);
  filter = input<string | null>();

  filteredGenerators = computed(() =>
    this.generators().filter((g) => this.matchesFilter(g))
  );

  constructor() {
    addIcons({createOutline, trashOutline});

    this.subscription = toObservable(
      this.persistenceService.generators
    ).subscribe(() => this.importGenerators());
  }

  ngOnInit() {
    this.timerInterval = setInterval(() => this.updateGenerators(), 1000);
  }

  private importGenerators() {
    // First time when the generators appear, the width of the bars doesn't animate
    // for a second (because there is nothing to animate from). To prevent that,
    // first import sets the remaining time to be 1s more and changes it to the
    // correct value right away, so it animates from the start.

    let firstTime = this.generators().length == 0;

    this.generators.set(
      this.persistenceService.generators().map((g) => {
        let code = this.otpGeneratorsService.generateOtp(g);
        return {
          params: g,
          code: code,
          secsRemaining:
            Math.floor((code.expires - Date.now()) / 1000) +
            (firstTime ? 1 : 0),
        };
      })
    );

    if (firstTime) {
      setTimeout(() => {
        this.generators().forEach(
          (g) =>
            (g.secsRemaining = Math.floor((g.code.expires - Date.now()) / 1000))
        );
      }, 50);
    }
  }

  private updateGenerators() {
    let now = Date.now();

    let regenerationRequired = this.generators().some(
      (g) => g.code.expires < now
    );

    if (regenerationRequired) {
      this.importGenerators();

      // generators with new codes
      let refreshed = this.generators().filter(
        (g) => g.secsRemaining == g.params.period - 1
      );

      // set timer to full
      for (let g of refreshed) {
        g.secsRemaining = g.params.period;
      }
      // setTimeout makes this code run after the DOM has been updated
      // so the bar jumps instantly to full width, instead of animating from 0
      // (see this.barTimerTransition)
      setTimeout(() => {
        // start shrinking the bar after the bar has been set to full width
        for (let g of refreshed) {
          g.secsRemaining = g.params.period - 1;
        }
        this.appRef.tick();
      }, 50);
    } else {
      // only update the remaining time
      let newGenerators = this.generators().map((g) => {
        g.secsRemaining = Math.floor((g.code.expires - now) / 1000);
        return g;
      });
      this.generators.set(newGenerators);
    }
  }

  barTimerWidth(gen: GeneratorData) {
    // evaluated every time the text timer changes (every second)
    return (100 * gen.secsRemaining) / gen.params.period + '%';
  }

  barTimerTransition(gen: GeneratorData) {
    // While the bar is shrinking, we want it to animate. When it's resetting to full width, we don't want it to animate.
    return gen.secsRemaining === gen.params.period ? 'none' : 'width 1s linear';
  }

  secsRemaining(gen: GeneratorData) {
    // When the timer is reset to full period, it would show a period value (ex 30s) for a brief moment, which looks like a flicker.
    // This prevents that by showing the next value
    return Math.min(gen.secsRemaining, gen.params.period - 1);
  }

  async copyCode(index: number, event: Event) {
    event.stopPropagation();

    let code = this.generators()[index].code;

    await Clipboard.write({
      string: code.otp,
    });

    const toast = await this.toastController.create({
      message: this.text.copied,
      duration: 2000,
    });
    await toast.present();
  }

  async deleteGenerator(index: number) {
    await this.alertService.dangerousAction(
      this.text.deleteDialogTitle,
      this.text.deleteDialogMessage,
      this.text.deleteDialogCheckbox,
      this.text.deleteDialogCancel,
      this.text.deleteDialogDelete,
      async () => {
        await this.persistenceService.deleteGenerator(index);
        await this.alertService.toast(this.text.generatorDeleted);
      }
    );
  }

  async editGenerator(index: number) {
    let newGenerator = await this.modalService.display(
      ManualEnterModalComponent,
      1.0,
      false,
      {generator: this.generators()[index].params}
    );
    if (newGenerator) {
      await this.persistenceService.updateGenerator(index, newGenerator);
      await this.alertService.toast(this.text.generatorUpdated);
    }
  }

  private matchesFilter(gen: GeneratorData) {
    if (!this.filter()) return true;

    let filter = this.filter()!.toLowerCase();
    return (
      gen.params.issuer.toLowerCase().includes(filter) ||
      gen.params.account.toLowerCase().includes(filter)
    );
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    this.subscription.unsubscribe();
  }
}
