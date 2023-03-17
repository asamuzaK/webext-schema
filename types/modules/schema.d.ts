export class Schema {
    constructor(...args?: (string | object)[]);
    _sandbox: sinon.SinonSandbox;
    _importMap: Map<any, any>;
    _refMap: Map<any, any>;
    _browser: {
        _sandbox: sinon.SinonSandbox;
    };
    _schema: any;
    set channel(arg: any);
    get channel(): any;
    _getTargetFromNamespace(key: string): object;
    _assignImportMap(): void;
    _assignRefMap(): void;
    _mockEvents(target: object, events: any[]): object;
    _mockFunctions(target: object, funcs: any[]): object;
    _mockProperties(target: object, props: object, namespace: string): object;
    _mockTypes(target: object, types: any[], namespace: string): object;
    _parseSchemaContent(): object;
    get(name: string): any[];
    getAll(): object;
    list(): any[];
    mock(): object;
    #private;
}
import sinon from 'sinon';
