export class Schema {
    constructor(...args?: (string | object)[]);
    _sandbox: sinon.SinonSandbox;
    _importMap: Map<any, any>;
    _refMap: Map<any, any>;
    _browser: {
        _sandbox: sinon.SinonSandbox;
    };
    _schema: any;
    set channel(ch: any);
    get channel(): any;
    private _getTargetFromNamespace;
    private _assignImportMap;
    private _assignRefMap;
    private _mockEvents;
    private _mockFunctions;
    private _mockProperties;
    private _mockTypes;
    private _parseSchemaContent;
    get(name: string): Array<object> | null;
    getAll(): object;
    list(): Array<string>;
    mock(): object;
    #private;
}
import sinon from 'sinon';
