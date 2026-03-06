from enum import Enum


class EventTypeEnum(str, Enum):
    CREATED = "Criada"
    UPDATED = "Atualizada"
    CANCELED = "Cancelada"
