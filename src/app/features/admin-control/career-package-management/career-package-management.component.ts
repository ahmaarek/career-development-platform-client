import { Component, OnInit } from '@angular/core';
import { CareerPackageService } from '../../career-package/career-package.service';
import { CareerPackageTemplate } from '../../career-package/models/career-package-template.interface';
import { CareerPackagePanelComponent } from './panel/career-package-panel.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-career-packages',
  imports: [CommonModule,CareerPackagePanelComponent],
  templateUrl: './career-package-management.component.html',
  styleUrls: ['./career-package-management.component.css']
})
export class CareerPackagesComponent implements OnInit {
  careerPackages: CareerPackageTemplate[] = [];

  constructor(private careerPackageService: CareerPackageService) {}

  ngOnInit(): void {
    this.careerPackageService.getAllCareerPackageTemplates().subscribe(packages => {
      this.careerPackages = packages;
    });
  }

  addNewCareerPackage(): void {
  this.careerPackageService.createNewPackage({
    title: 'Untitled Package',
    description: ''
  }).subscribe((newPkg: CareerPackageTemplate) => {
    this.careerPackages.push(newPkg);
  });
}
}
