/**
 * Arquivo central de exportações da biblioteca Contracts.
 *
 * Responsável por reunir e disponibilizar os módulos, serviços e DTOs
 * compartilhados entre o API Gateway e os microsserviços.
 *
 * Facilita a importação desses componentes por meio de um único
 * caminho, evitando a necessidade de referenciar cada arquivo diretamente.
 */

export * from './contracts.module.js';
export * from './contracts.service.js';
export * from './users.dto.js';
export * from './orders.dto.js';