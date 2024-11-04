import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {StorageService} from './storage.service';
import {GeneratorParameters} from "../models/model";

@Injectable({
  providedIn: 'root',
})
export class PersistenceService {

  private storage = inject(StorageService);

  private privateGenerators: WritableSignal<GeneratorParameters[]> = signal([]);
  generators = this.privateGenerators.asReadonly();

  private readonly generatorsKey = 'generators';

  async saveGenerator(generator: GeneratorParameters) {
    this.privateGenerators.update((generators) => [generator, ...generators]);
    await this.store();
  }

  async removeGenerator(index: number) {
    this.privateGenerators.update((generators) => {
      const newGenerators = [...generators];
      newGenerators.splice(index, 1);
      return newGenerators;
    });
    await this.store();
  }

  async updateGenerator(index: number, generator: GeneratorParameters) {
    this.privateGenerators.update((generators) => {
      const newGenerators = [...generators];
      newGenerators[index] = generator;
      return newGenerators;
    });
    await this.store();
  }

  async deleteGenerator(index: number) {
    this.privateGenerators.update((generators) => {
      const newGenerators = [...generators];
      newGenerators.splice(index, 1);
      return newGenerators;
    });
    await this.store();
  }

  async store() {
    let json = JSON.stringify(this.generators());
    await this.storage.set(this.generatorsKey, json);
  }

  async load() {
    let generators = await this.storage.get(this.generatorsKey);
    if (generators) {
      this.privateGenerators.set(JSON.parse(generators));
    }
  }
}
