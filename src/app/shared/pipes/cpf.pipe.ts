import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cpf',
    standalone: true 
})
export class CpfPipe implements PipeTransform {

    transform(value: string | number): string {
        if (!value) return '';

        let cpf = value.toString().replace(/\D/g, '');

        if (cpf.length !== 11) {
            return value.toString();
        }

        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}
