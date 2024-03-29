import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

import { MessageService } from '../../messages/message.service';

import {Product, ProductResolved} from '../product';
import { ProductService } from '../product.service';

@Component({
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit{
  pageTitle = 'Product Edit';
  errorMessage: string | undefined = '';

  product: Product | null = null;

  private dataisValid: { [key: string]: boolean} ={};

  constructor(private productService: ProductService,
    private messageService: MessageService,
    private route:ActivatedRoute,
    private router:Router) { }

  ngOnInit() {
    const resolvedData: ProductResolved = this.route.snapshot.data['resolvedData'];
    this.errorMessage = resolvedData.error;
    this.onProductRetrieved(resolvedData.product);
  }


  onProductRetrieved(product: Product | null): void {
    this.product = product;

    if (!this.product) {
      this.pageTitle = 'No product found';
    } else {
      if (this.product.id === 0) {
        this.pageTitle = 'Add Product';
      } else {
        this.pageTitle = `Edit Product: ${this.product.productName}`;
      }
    }
  }

  deleteProduct(): void {
      if (!this.product || !this.product.id) {
        // Don't delete, it was never saved.
        this.onSaveComplete(`${this.product?.productName} was deleted`);
      } else {
        if (confirm(`Really delete the product: ${this.product.productName}?`)) {
          this.productService.deleteProduct(this.product.id).subscribe({
            next: () => this.onSaveComplete(`${this.product?.productName} was deleted`),
            error: err => this.errorMessage = err
          });
        }
      }
  }

  isValid(path?: string):boolean{
    this.validate();
    if(path){
      return this.dataisValid[path];
    }
    return(this.dataisValid && Object.keys(this.dataisValid).every(d =>this.dataisValid[d]));
  }


  saveProduct(): void {
    if (this.product) {
      if (this.product.id === 0) {
        this.productService.createProduct(this.product).subscribe({
          next: () => this.onSaveComplete(`The new ${this.product?.productName} was saved`),
          error: err => this.errorMessage = err
        });
      } else {
        this.productService.updateProduct(this.product).subscribe({
          next: () => this.onSaveComplete(`The updated ${this.product?.productName} was saved`),
          error: err => this.errorMessage = err
        });
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onSaveComplete(message?: string): void {
    if (message) {
      this.messageService.addMessage(message);
    }
    // Navigate back to the product list
    this.router.navigate(['/products'])
  }

  validate(): void{
    //clear valid object
    this.dataisValid = {};

    //'info' tab
    if(this.product?.productName &&
    this.product.productName.length >= 3 &&
    this.product.productCode){
      this.dataisValid['info'] = true;
    }
    else {
      this.dataisValid['info'] = false;
    }

    //'tags' tab
    if(this.product?.category &&
    this.product.category.length >= 3){
      this.dataisValid['tags'] = true;
    }
    else {
      this.dataisValid['info'] = false;
    }
  }
}
