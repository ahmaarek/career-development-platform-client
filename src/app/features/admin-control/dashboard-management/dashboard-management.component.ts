import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RankConfigService } from '../../learning/library/services/rank-config.service';
import { RankConfig } from '../../learning/library/models/rank-config.model';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../alert/alert.service';

@Component({
  selector: 'app-dashboard-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-management.component.html',
  styleUrl: './dashboard-management.component.css'
})

export class DashboardManagementComponent implements OnInit {

  form: FormGroup;
  maxPoints = 2000;

  constructor(
    private fb: FormBuilder,
    private rankService: RankConfigService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      ranks: this.fb.array([])
    });
  }

  get ranks(): FormArray {
    return this.form.get('ranks') as FormArray;
  }

  get rankGroups(): FormGroup[] {
    return this.ranks.controls as FormGroup[];
  }

  ngOnInit(): void {
    this.rankService.getAllRanks().subscribe(ranks => {
      ranks.forEach(rank => {
        this.ranks.push(this.createRankGroup(rank));
      });
    });
  }

  createRankGroup(rank: RankConfig): FormGroup {
    return this.fb.group({
      name: [rank.name],
      pointsRequired: [rank.pointsRequired]
    });
  }

  addRank(): void {
    this.ranks.push(this.createRankGroup({ name: '', pointsRequired: 0 }));
  }

  deleteRank(index: number): void {
    this.ranks.removeAt(index);
  }

  confirm(): void {
    const rankList: RankConfig[] = this.ranks.value;
    this.rankService.replaceAllRanks(rankList).subscribe(() => {
      this.alertService.showAlert('success','Ranks updated successfully!');
    }, err => {
      this.alertService.showAlert('error','Failed to update ranks: ' + err.error);
    });
  }
}