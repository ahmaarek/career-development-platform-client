import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message: string = '';
  @Output() closed = new EventEmitter<void>();
  @Input() duration = 5000;
  
  ngOnInit():void {
        setTimeout(() => this.close(), this.duration);
  }

  close() {
    this.closed.emit();
  }
}