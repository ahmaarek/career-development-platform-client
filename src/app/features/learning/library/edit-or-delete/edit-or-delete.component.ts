import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { BlogWikiService } from '../services/blog-wiki.service';
import { CommonModule } from '@angular/common';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';

@Component({
  selector: 'app-edit-or-delete',
  templateUrl: './edit-or-delete.component.html',
  styleUrls: ['./edit-or-delete.component.css'],
  imports: [CommonModule]
})

export class EditOrDeleteComponent implements OnInit {
  blogs: BlogWikiDTO[] = [];
  wikis: BlogWikiDTO[] = [];
  learningMaterials: LearningMaterialTemplate[] = [];

  expanded = {
    blog: false,
    wiki: false,
    learning: false
  };

  showDeleteModal = false;
  entryToDelete: { id: string, type: 'blog-wiki' | 'learning' } | null = null;

  constructor(
    private router: Router,
    private blogWikiService: BlogWikiService,
    private learningService: LearningMaterialTemplateService
  ) {}

  ngOnInit(): void {
    this.blogWikiService.getBlogs().subscribe(b => this.blogs = b);
    this.blogWikiService.getWikis().subscribe(w => this.wikis = w);
    this.learningService.getAllTemplates().subscribe(t => this.learningMaterials = t);
  }

  toggle(type: 'blog' | 'wiki' | 'learning') {
    this.expanded[type] = !this.expanded[type];
  }

  edit(entry: any, type: 'blog-wiki' | 'learning') {
    this.router.navigate([`library/edit/${type}/${entry.id}`]);
  }

  delete(entry: any, type: 'blog-wiki' | 'learning') {
    this.entryToDelete = { id: entry.id, type };
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.entryToDelete = null;
    this.showDeleteModal = false;
  }

  deleteConfirmed() {
    if (!this.entryToDelete) return;

    const { id, type } = this.entryToDelete;

    if (type === 'blog-wiki') {
      this.blogWikiService.deleteEntry(id).subscribe(() => {
        this.blogs = this.blogs.filter(b => b.id !== id);
      });
    }  else if (type === 'learning') {
      this.learningService.deleteTemplate(id).subscribe(() => {
        this.learningMaterials = this.learningMaterials.filter(m => m.id !== id);
      });
    }

    this.cancelDelete();
  }
}
