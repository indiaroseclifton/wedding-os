"""Isolated local integration checks: starts Next with a disposable file store."""
import copy, json, os, pathlib, subprocess, tempfile, time, urllib.request, urllib.error, urllib.parse
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='http://127.0.0.1:3102'
COOKIE='wedding_os_user='+urllib.parse.quote(json.dumps({'userId':'user_alex','name':'Alex Rivera','email':'alex@example.com'}),safe='')
def request(path,body=None,auth=True,origin=None):
    headers={'Content-Type':'application/json'}
    if auth: headers['Cookie']=COOKIE
    if origin: headers['Origin']=origin
    req=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=100) as r: return r.status,r.read().decode()
    except urllib.error.HTTPError as e:return e.code,e.read().decode()
def api(body,expected=200):
    status,raw=request('/api/studio/workbench',body)
    assert status==expected,(status,raw[:500]);return json.loads(raw)
def save(p):return dict(action='save',id=p['id'],expectedVersion=p.get('version',0),**{k:p[k] for k in ['title','qty','budget','note','owner','zone','design','materials','steps']})
with tempfile.TemporaryDirectory(prefix='vowfolk-studio-test-') as temp:
    env=dict(os.environ,DATA_DIR=temp,DATA_BACKEND='file',DEMO_AUTH='1',AUTH_SECRET='studio-local-test-secret-never-for-production',OPENAI_API_KEY='',CANVA_CLIENT_ID='',CANVA_CLIENT_SECRET='',PINTEREST_CLIENT_ID='',PINTEREST_CLIENT_SECRET='')
    with open(pathlib.Path(temp)/'server.log','w') as log:
        server=subprocess.Popen(['node','node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3102'],cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
        try:
            for _ in range(100):
                if server.poll() is not None:raise RuntimeError((pathlib.Path(temp)/'server.log').read_text()[-3000:])
                try:
                    status,_=request('/api/health',auth=False)
                    if status==200:break
                except (OSError,TimeoutError):pass
                time.sleep(.5)
            else:raise RuntimeError('Test server did not become ready')
            assert request('/api/studio/workbench',auth=False)[0]==401;print('PASS unauthenticated access rejected',flush=True)
            p=api({'action':'create','kind':'floral','qty':12},201)['project'];rose=next(m for m in p['materials'] if m.get('catalogId')=='garden-rose');rose['orderedQty']=80;rose['receivedQty']=75;p=api(save(p))['project'];assert next(m for m in p['materials'] if m['id']==rose['id'])['orderedQty']==80;print('PASS create and purchasing persistence',flush=True)
            stale=save(p);p['qty']=15;p=api(save(p))['project'];assert next(m for m in p['materials'] if m['id']==rose['id'])['qty']==87;api(stale,409);print('PASS quantity propagation and stale-save protection',flush=True)
            p['design']['approval']={'status':'approved','by':'Impersonated approver','at':'1900'};p['design']['comments']=[dict(id='c1',body='Private team discussion',author='Impersonated author',at='1900',resolved=False)];p=api(save(p))['project'];assert p['design']['approval']['by']=='Alex Rivera';assert p['design']['comments'][0]['author']=='Alex Rivera';print('PASS server-authenticated approvals and comments',flush=True)
            p['design']['objects'][0]['x']+=1;p=api(save(p))['project'];assert p['design']['approval']['status']=='review';print('PASS changed design requires renewed approval',flush=True)
            bad=copy.deepcopy(p);bad['design']['boxes']=[dict(id='b1',name='Bad box',destination='Table 1',owner='Alex',transport='',after='keep',items=[dict(materialId=rose['id'],qty=1,packed=2,placed=0)])];api(save(bad),400);print('PASS impossible packing quantity rejected',flush=True)
            bad=copy.deepcopy(p);bad['steps'][1]['done']=True;api(save(bad),400);print('PASS task dependencies enforced by API',flush=True)
            p['note']='Private project note';p=api(save(p))['project'];url=api({'action':'share','id':p['id']})['url'];status,html=request(url,auth=False);assert status==200;assert 'Garden centerpiece' in html;assert 'Private project note' not in html and 'Private team discussion' not in html;api({'action':'revoke','id':p['id']});assert request(url,auth=False)[0]==404;print('PASS sanitized anonymous guide and revocation',flush=True)
            assert request('/api/studio/workbench',{'action':'create','kind':'table'},origin='https://untrusted.example')[0]==403;print('PASS cross-origin writes rejected',flush=True)
            assert request('/api/studio/connections/canva/authorize',{})[0]==503;assert request('/api/studio/assistant',{})[0]==503;print('PASS unconfigured providers and AI report unavailable',flush=True)
            q=api({'action':'duplicate','id':p['id']})['project'];assert not q.get('shareToken');assert all(not m.get('orderedQty') and not m.get('receivedQty') for m in q['materials']);assert not q['design']['comments'];print('PASS option duplication clears purchase and sharing state',flush=True)
            status,html=request('/studio/cards');assert status==200 and 'Paper &amp; websites' in html and 'Canva' in html;print('PASS professional stationery route renders',flush=True)
        finally:
            server.terminate()
            try:server.wait(timeout=10)
            except subprocess.TimeoutExpired:server.kill()
