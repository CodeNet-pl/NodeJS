import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventBus } from '../events';
import { ExplorerService } from './explorer.service';

@Module({
  providers: [EventBus, ExplorerService],
  exports: [EventBus],
})
export class EventBusModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly explorerService: ExplorerService,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    const { events } = this.explorerService.explore();

    events.forEach((event) => {
      const instance = this.moduleRef.get(event, { strict: false });
      if (!instance) {
        return;
      }
      this.eventBus.register(instance);
    });
  }
}
