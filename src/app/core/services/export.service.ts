import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() {}

  /**
   * Exporter des données en Excel
   */
  exportToExcel(data: any[], filename: string, sheetName: string = 'Data'): void {
    // Créer un nouveau workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName]
    };

    // Générer le buffer Excel
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    // Sauvegarder le fichier
    this.saveAsExcelFile(excelBuffer, filename);
  }

  /**
   * Sauvegarder le buffer Excel en fichier
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  /**
   * Exporter en PDF (simple - impression navigateur)
   */
  exportToPDF(elementId: string, filename: string): void {
    // Utiliser l'impression du navigateur
    window.print();
  }

  /**
   * Formater les données pour l'export
   */
  formatDataForExport(data: any[], columns: { field: string; header: string }[]): any[] {
    return data.map(item => {
      const formattedItem: any = {};
      columns.forEach(col => {
        formattedItem[col.header] = this.getNestedProperty(item, col.field);
      });
      return formattedItem;
    });
  }

  /**
   * Obtenir une propriété imbriquée d'un objet
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  /**
   * Formater une date pour l'export
   */
  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  /**
   * Formater une devise pour l'export
   */
  formatCurrency(value: number): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}