from datetime import datetime #, UTC
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import init_db
import app.database as db

from app.api.admin.channel import api as admin_channel
from app.api.admin.gallery import api as admin_gallery
from app.api.admin.user import api as admin_user

from app.api.public.auth import api as public_auth

from app.api.play.play import api as play_user
# Add Play Space API import
from app.api.play.space import api as play_space_router

from app.api.studio.user import api as studio_user
from app.api.studio.channel.channel import api as channel_router
from app.api.studio.channel.setting import api as setting_router
from app.api.studio.channel.content import api as content_router
# Add Studio Space API import
from app.api.studio.space import api as space_router
# from app.api.studio.gallery import api as studio_gallery

from app.models import Response_Model
from app.messages import Error, inject_messages
from app.messages.general import General_Message
from app.translations import load_translations, translate
from app.utils.changelog import get_change_log, get_version
from app.utils.openapi import patch_openapi


# ~~~~~~~~~~ APP ~~~~~~~~~~ #
@asynccontextmanager
async def lifespan(app: FastAPI):
    db.fs = await init_db()
    load_translations()
    inject_messages()
    yield

app = FastAPI(
    title='YaraLEX API',
    lifespan=lifespan,
    version=get_version(),
    description=get_change_log()
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.openapi = lambda: patch_openapi(app)

# ~~~~~~~~~~ PUBLIC ▸ ROUTERS ~~~~~~~~~~ #
app.include_router(public_auth, tags=['Public ▸ Auth'], prefix='/public/auth')

# ~~~~~~~~~~ STUDIO ▸ ROUTERS ~~~~~~~~~~ #
app.include_router(studio_user, tags=['Studio ▸ User'], prefix='/studio/user')
app.include_router(channel_router, tags=['Studio ▸ Channel'], prefix='/studio/channel')
app.include_router(content_router, tags=['Studio ▸ Content'], prefix='/studio/channel/content')
app.include_router(setting_router, tags=['Studio ▸ Setting'], prefix='/studio/channel/setting')
# Add Studio Space API router
app.include_router(space_router, tags=['Studio ▸ Space'], prefix='/studio/space')

# ~~~~~~~~~~ PLAY ▸ ROUTERS ~~~~~~~~~~ #
app.include_router(play_user, tags=['Play ▸ User'], prefix='/play/user')
# Add Play Space API router
app.include_router(play_space_router, tags=['Play ▸ Space'], prefix='/play/space')

# ~~~~~~~~~~ ADMIN ▸ ROUTERS ~~~~~~~~~~ #
app.include_router(admin_user, tags=['Admin ▸ User'], prefix='/admin/user')


# ~~~~~~~~~~ ERRORS ~~~~~~~~~~ #
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []
    for error in errors:
        if error['type'] == 'value_error.jsondecode':
            messages.append({'error': {'message': 'Invalid JSON body'}, 'status': 0})
        else:
            messages.append(error.get('msg', ''))
    response = {
        'success': False,
        'data': None,
        'message': translate(General_Message.VALIDATION_ERROR.value),
        'error_code': 'VALIDATION_ERROR'
    }
    return JSONResponse(
        content=response,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )

@app.exception_handler(Error)
async def custom_exception_handler(request: Request, exc: Error):
    return JSONResponse(
        status_code=406,
        content={
            'success': False,
            'data': None,
            'message': exc.messages,
            'error': exc.code,
        }
    )
