import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-personal-info',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css',
  encapsulation: ViewEncapsulation.None
})
export class PersonalInfoComponent {
  @Input() formGroup!: FormGroup;
}
